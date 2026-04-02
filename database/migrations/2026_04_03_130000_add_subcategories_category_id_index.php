<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PostgreSQL does not index foreign-key columns by default; speeds up joins and
 * Category::with('subcategories') on large catalogs.
 */
return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        if (! Schema::hasTable('subcategories')) {
            return;
        }

        if (Schema::hasIndex('subcategories', ['category_id'])) {
            return;
        }

        Schema::table('subcategories', function (Blueprint $table) {
            $table->index('category_id');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('subcategories')) {
            return;
        }

        Schema::table('subcategories', function (Blueprint $table) {
            $table->dropIndex(['category_id']);
        });
    }
};
