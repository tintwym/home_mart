<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Upgrades databases that ran the old schema (listings.category_id → categories with optional
 * self-referential categories.category_id) to subcategories + listings.subcategory_id.
 */
return new class extends Migration
{
    public $withinTransaction = false;

    /**
     * @param  list<string>  $columns
     */
    private function dropPostgresForeignKeysOnColumns(string $table, array $columns): void
    {
        if (Schema::getConnection()->getDriverName() !== 'pgsql' || $columns === []) {
            return;
        }

        $placeholders = implode(',', array_fill(0, count($columns), '?'));
        $bindings = array_merge([$table], $columns);
        $rows = DB::select("
            SELECT DISTINCT c.conname
            FROM pg_constraint c
            JOIN pg_class rel ON rel.oid = c.conrelid
            JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
            CROSS JOIN LATERAL unnest(c.conkey) AS ck(attnum)
            JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ck.attnum
            WHERE c.contype = 'f'
              AND rel.relname = ?
              AND nsp.nspname = current_schema()
              AND a.attname IN ({$placeholders})
        ", $bindings);

        foreach ($rows as $row) {
            $name = str_replace('"', '""', $row->conname);
            DB::statement('ALTER TABLE "'.$table.'" DROP CONSTRAINT IF EXISTS "'.$name.'"');
        }
    }

    private function dropCategoriesHierarchyColumn(): void
    {
        if (! Schema::hasTable('categories')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            $this->dropPostgresForeignKeysOnColumns('categories', ['category_id', 'parent_id']);
        } else {
            Schema::table('categories', function (Blueprint $table) {
                if (Schema::hasColumn('categories', 'category_id')) {
                    try {
                        $table->dropConstrainedForeignId('category_id');
                    } catch (\Throwable) {
                        if (Schema::hasColumn('categories', 'category_id')) {
                            try {
                                $table->dropForeign(['category_id']);
                            } catch (\Throwable) {
                            }
                        }
                    }
                } elseif (Schema::hasColumn('categories', 'parent_id')) {
                    try {
                        $table->dropConstrainedForeignId('parent_id');
                    } catch (\Throwable) {
                        if (Schema::hasColumn('categories', 'parent_id')) {
                            try {
                                $table->dropForeign(['parent_id']);
                            } catch (\Throwable) {
                            }
                        }
                    }
                }
            });
        }

        Schema::table('categories', function (Blueprint $table) {
            if (Schema::hasColumn('categories', 'category_id')) {
                $table->dropColumn('category_id');
            }
            if (Schema::hasColumn('categories', 'parent_id')) {
                $table->dropColumn('parent_id');
            }
        });
    }

    public function up(): void
    {
        if (! Schema::hasTable('listings') || ! Schema::hasColumn('listings', 'category_id')) {
            return;
        }

        if (! Schema::hasTable('subcategories')) {
            Schema::create('subcategories', function (Blueprint $table) {
                $table->ulid('id')->primary();
                $table->foreignUlid('category_id')
                    ->constrained('categories')
                    ->cascadeOnDelete();
                $table->string('name');
                $table->string('slug')->unique();
                $table->timestamps();
            });
        }

        if (! Schema::hasColumn('listings', 'subcategory_id')) {
            Schema::table('listings', function (Blueprint $table) {
                $table->ulid('subcategory_id')->nullable()->after('user_id');
            });
        }

        $now = now();
        $hadHierarchy = Schema::hasColumn('categories', 'category_id');

        if ($hadHierarchy) {
            $children = DB::table('categories')->whereNotNull('category_id')->get();
            foreach ($children as $row) {
                $exists = DB::table('subcategories')->where('id', $row->id)->exists();
                if (! $exists) {
                    DB::table('subcategories')->insert([
                        'id' => $row->id,
                        'category_id' => $row->category_id,
                        'name' => $row->name,
                        'slug' => $row->slug,
                        'created_at' => $row->created_at ?? $now,
                        'updated_at' => $row->updated_at ?? $now,
                    ]);
                }
            }

            $childIds = $children->pluck('id')->all();
            foreach ($childIds as $childId) {
                DB::table('listings')->where('category_id', $childId)->update([
                    'subcategory_id' => $childId,
                ]);
            }

            $parentIds = DB::table('categories')->whereNull('category_id')->pluck('id');
            foreach ($parentIds as $parentId) {
                $firstSubId = DB::table('subcategories')
                    ->where('category_id', $parentId)
                    ->orderBy('id')
                    ->value('id');

                if (! $firstSubId) {
                    $firstSubId = (string) Str::ulid();
                    $slug = DB::table('categories')->where('id', $parentId)->value('slug');
                    $name = DB::table('categories')->where('id', $parentId)->value('name');
                    DB::table('subcategories')->insert([
                        'id' => $firstSubId,
                        'category_id' => $parentId,
                        'name' => 'General',
                        'slug' => ($slug ? $slug.'-general' : 'general-'.$firstSubId),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }

                DB::table('listings')
                    ->where('category_id', $parentId)
                    ->whereNull('subcategory_id')
                    ->update(['subcategory_id' => $firstSubId]);
            }

            $this->dropCategoriesHierarchyColumn();

            if ($childIds !== []) {
                DB::table('categories')->whereIn('id', $childIds)->delete();
            }
        } else {
            $categories = DB::table('categories')->get();
            foreach ($categories as $cat) {
                $sid = (string) Str::ulid();
                $baseSlug = $cat->slug;
                $slug = $baseSlug.'-items';
                $n = 0;
                while (DB::table('subcategories')->where('slug', $slug)->exists()) {
                    $n++;
                    $slug = $baseSlug.'-items-'.$n;
                }
                DB::table('subcategories')->insert([
                    'id' => $sid,
                    'category_id' => $cat->id,
                    'name' => $cat->name,
                    'slug' => $slug,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                DB::table('listings')->where('category_id', $cat->id)->update(['subcategory_id' => $sid]);
            }
        }

        $orphans = DB::table('listings')->whereNull('subcategory_id')->count();
        if ($orphans > 0) {
            $fallback = DB::table('subcategories')->orderBy('id')->value('id');
            if ($fallback) {
                DB::table('listings')->whereNull('subcategory_id')->update(['subcategory_id' => $fallback]);
            }
        }

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            $this->dropPostgresForeignKeysOnColumns('listings', ['category_id']);
        }

        Schema::table('listings', function (Blueprint $table) {
            if (Schema::hasColumn('listings', 'category_id')) {
                if (Schema::getConnection()->getDriverName() !== 'pgsql') {
                    try {
                        $table->dropForeign(['category_id']);
                    } catch (\Throwable) {
                    }
                }
                $table->dropColumn('category_id');
            }
        });

        Schema::table('listings', function (Blueprint $table) {
            $table->foreign('subcategory_id')
                ->references('id')
                ->on('subcategories')
                ->cascadeOnDelete();
        });

        DB::table('listings')->whereNull('subcategory_id')->delete();
    }

    public function down(): void
    {
        // Irreversible data merge; restore old columns only for empty dev DBs.
    }
};
