<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Listing;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
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

    public function test_mapi_password_requires_bearer_token(): void
    {
        $this->putJson('/mapi/password', [
            'current_password' => 'oldpass1',
            'password' => 'newpass12',
            'password_confirmation' => 'newpass12',
        ])->assertUnauthorized();
    }

    public function test_mapi_password_rejects_mismatched_password_confirmation(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('secret1234'),
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $this->putJson('/mapi/password', [
            'current_password' => 'secret1234',
            'password' => 'newpass12',
            'password_confirmation' => 'different12',
        ], [
            'Authorization' => 'Bearer '.$token,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);

        $user->refresh();
        $this->assertTrue(Hash::check('secret1234', $user->password), 'Password must not change when confirmation mismatches.');
    }

    public function test_mapi_password_rejects_missing_password_confirmation(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('secret1234'),
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $this->putJson('/mapi/password', [
            'current_password' => 'secret1234',
            'password' => 'newpass12',
        ], [
            'Authorization' => 'Bearer '.$token,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public function test_mapi_password_updates_with_valid_current_password(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('secret1234'),
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $this->putJson('/mapi/password', [
            'current_password' => 'secret1234',
            'password' => 'newpass12',
            'password_confirmation' => 'newpass12',
        ], [
            'Authorization' => 'Bearer '.$token,
        ])
            ->assertOk()
            ->assertJsonPath('message', __('Password updated.'));

        $user->refresh();
        $this->assertTrue(Hash::check('newpass12', $user->password));
    }

    public function test_mapi_user_password_alias_matches_password_route(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('secret1234'),
        ]);
        $token = $user->createToken('test')->plainTextToken;
        $headers = ['Authorization' => 'Bearer '.$token];
        $body = [
            'current_password' => 'secret1234',
            'password' => 'another12',
            'password_confirmation' => 'another12',
        ];

        $this->putJson('/mapi/user/password', $body, $headers)->assertOk();
        $user->refresh();
        $this->assertTrue(Hash::check('another12', $user->password));
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
