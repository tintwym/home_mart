<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_categories_returns_json_list(): void
    {
        Category::create(['name' => 'Alpha', 'slug' => 'alpha']);
        Category::create(['name' => 'Beta', 'slug' => 'beta']);

        $response = $this->getJson('/api/categories');

        $response->assertOk()
            ->assertJsonPath('data.0.slug', 'alpha')
            ->assertJsonPath('data.1.slug', 'beta');
    }

    public function test_listings_returns_paginated_json(): void
    {
        $seller = User::factory()->create();
        $category = Category::create(['name' => 'Cat', 'slug' => 'cat']);
        Listing::create([
            'user_id' => $seller->id,
            'category_id' => $category->id,
            'title' => 'Phone',
            'description' => 'Smart',
            'condition' => 'new',
            'price' => 10,
        ]);

        $response = $this->getJson('/api/listings?q=Phone');

        $response->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.title', 'Phone');
    }

    public function test_listing_show_returns_detail_json(): void
    {
        $seller = User::factory()->create();
        $category = Category::create(['name' => 'Cat', 'slug' => 'cat']);
        $listing = Listing::create([
            'user_id' => $seller->id,
            'category_id' => $category->id,
            'title' => 'Item',
            'description' => 'Desc',
            'condition' => 'used',
            'price' => 5,
        ]);

        $response = $this->getJson('/api/listings/'.$listing->id);

        $response->assertOk()
            ->assertJsonPath('data.id', $listing->id)
            ->assertJsonPath('data.title', 'Item')
            ->assertJsonPath('data.category.slug', 'cat');
    }
}
