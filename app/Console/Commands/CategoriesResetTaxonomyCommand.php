<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Listing;
use App\Models\Subcategory;
use Database\Seeders\CategorySeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class CategoriesResetTaxonomyCommand extends Command
{
    protected $signature = 'categories:reset-taxonomy
                            {--force : Skip confirmation (required in production)}';

    protected $description = 'Remove all categories and subcategories, then re-seed the 14 parent categories and their subcategories from CategorySeeder. Deletes all listings first (they reference subcategories).';

    public function handle(): int
    {
        if (app()->environment('production') && ! $this->option('force')) {
            $this->error('In production, pass --force after you understand listings will be deleted.');

            return self::FAILURE;
        }

        $listingCount = Listing::query()->count();
        if ($listingCount > 0) {
            $this->warn("{$listingCount} listing(s) will be permanently deleted.");
        }

        if (! $this->option('force')) {
            if (! $this->confirm('Reset taxonomy and remove all listings?')) {
                return self::FAILURE;
            }
        }

        Listing::query()->delete();
        Subcategory::query()->delete();
        Category::query()->delete();

        $this->call(CategorySeeder::class);
        Cache::forget('categories.sidebar');

        $parents = Category::query()->count();
        $children = Subcategory::query()->count();
        $this->info("Done: {$parents} categories, {$children} subcategories.");

        if ($parents !== 14) {
            $this->warn('Expected 14 parent categories; update CategorySeeder if this count changed.');
        }

        return self::SUCCESS;
    }
}
