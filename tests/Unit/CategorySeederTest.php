<?php

namespace Tests\Unit;

use App\Models\Subcategory;
use Database\Seeders\CategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategorySeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_produces_unique_subcategory_slugs_and_is_idempotent(): void
    {
        (new CategorySeeder)->run();

        $slugs = Subcategory::query()->pluck('slug');
        $this->assertSame($slugs->count(), $slugs->unique()->count(), 'Subcategory slugs must be globally unique.');

        $count = Subcategory::query()->count();
        (new CategorySeeder)->run();
        $this->assertSame($count, Subcategory::query()->count(), 'Re-running the seeder must not duplicate rows.');
    }
}
