<?php

use App\Models\Category;
use Database\Seeders\CategorySeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * New production databases often have zero categories after migrate, so the navbar only shows "All".
     * This runs once: if the table exists but is empty, run the same seeder as local dev.
     */
    public function up(): void
    {
        if (app()->environment('testing')) {
            return;
        }

        if (! Schema::hasTable('categories')) {
            return;
        }

        if (Category::query()->exists()) {
            return;
        }

        (new CategorySeeder)->run();
        Cache::forget('categories.sidebar');
    }
};