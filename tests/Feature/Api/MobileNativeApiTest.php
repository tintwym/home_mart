<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Listing;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Ensures /mapi mirrors /api for native clients (Swift URLSession, OkHttp/Retrofit).
 * No cookies or CSRF — JSON body + Bearer token only.
 */
class MobileNativeApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_mapi_categories_matches_api_response(): void
    {
        Category::create(['name' => 'Alpha', 'slug' => 'alpha']);

        $api = $this->getJson('/api/categories')->assertOk()->json();
        $mapi = $this->getJson('/mapi/categories')->assertOk()->json();

        $this->assertSame($api, $mapi);
        $this->assertSame('alpha', $mapi['data'][0]['slug']);
    }

    public function test_mapi_login_post_json_is_not_csrf_rejected(): void
    {
        $response = $this->postJson('/mapi/login', [
            'email' => 'nobody@example.com',
            'password' => 'wrong',
        ]);

        $response->assertUnauthorized()
            ->assertJsonPath('message', 'Invalid credentials');
        $this->assertNotSame(419, $response->getStatusCode(), 'Native JSON login must not hit web CSRF (419).');
    }

    public function test_api_login_post_json_is_not_csrf_rejected(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nobody@example.com',
            'password' => 'wrong',
        ]);

        $response->assertUnauthorized();
        $this->assertNotSame(419, $response->getStatusCode());
    }

    public function test_mapi_login_returns_bearer_token_for_valid_user(): void
    {
        $user = User::factory()->create([
            'email' => 'ios@example.com',
            'password' => bcrypt('secret1234'),
        ]);

        $response = $this->postJson('/mapi/login', [
            'email' => 'ios@example.com',
            'password' => 'secret1234',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['user', 'token'])
            ->assertJsonPath('user.email', 'ios@example.com');

        $this->assertNotEmpty($response->json('token'));
    }

    public function test_mapi_user_requires_authorization_bearer(): void
    {
        $this->getJson('/mapi/user')->assertUnauthorized();
    }

    public function test_mapi_user_accepts_sanctum_bearer_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->getJson('/mapi/user', [
            'Authorization' => 'Bearer '.$token,
        ])
            ->assertOk()
            ->assertJsonPath('email', $user->email);
    }

    public function test_mapi_listings_matches_api_shape(): void
    {
        $seller = User::factory()->create();
        $category = Category::create(['name' => 'Cat', 'slug' => 'cat']);
        $sub = Subcategory::create([
            'category_id' => $category->id,
            'name' => 'Sub',
            'slug' => 'cat-sub',
        ]);
        Listing::create([
            'user_id' => $seller->id,
            'subcategory_id' => $sub->id,
            'title' => 'Desk',
            'description' => 'Wood',
            'condition' => 'used',
            'price' => 25,
        ]);

        $api = $this->getJson('/api/listings')->assertOk()->json();
        $mapi = $this->getJson('/mapi/listings')->assertOk()->json();

        $this->assertSame($api['meta']['total'] ?? null, $mapi['meta']['total'] ?? null);
        $this->assertSame($api['data'][0]['title'] ?? null, $mapi['data'][0]['title'] ?? null);
    }
}
