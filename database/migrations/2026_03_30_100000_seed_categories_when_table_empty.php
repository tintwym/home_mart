<?php

use App\Models\Category;
use App\Models\Subcategory;
use Database\Seeders\CategorySeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * New production DBs often have no taxonomy after migrate (navbar shows only "All").
     * Also re-runs when categories exist but subcategories are still empty (e.g. partial deploy).
     */
    public function up(): void
    {
        if (app()->environment('testing')) {
            return;
        }

        if (! Schema::hasTable('categories') || ! Schema::hasTable('subcategories')) {
            return;
        }

        if (Category::query()->exists() && Subcategory::query()->exists()) {
            return;
        }

        (new CategorySeeder)->run();
        Cache::forget('categories.sidebar');
    }
};
