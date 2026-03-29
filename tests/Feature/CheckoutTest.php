<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_redirects_when_cart_empty(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('checkout.store'));

        $response->assertRedirect(route('cart.index'));
        $response->assertSessionHas('error', 'Your cart is empty.');
    }

    public function test_checkout_creates_order_with_items_in_cart(): void
    {
        $user = User::factory()->create();
        $seller = User::factory()->create();
        $category = Category::create(['name' => 'Test', 'slug' => 'test']);
        $listing = Listing::create([
            'user_id' => $seller->id,
            'category_id' => $category->id,
            'title' => 'Test Item',
            'description' => 'Test',
            'condition' => 'new',
            'price' => 99.99,
        ]);

        $user->cartItems()->create(['listing_id' => $listing->id]);

        $this->actingAs($user);

        // Ensure Stripe is not configured so controller marks order completed (no redirect to Stripe)
        config(['services.stripe.secret' => null]);

        $response = $this->post(route('checkout.store'));

        $order = \App\Models\Order::where('user_id', $user->id)->first();
        $this->assertNotNull($order);
        // When Stripe is not configured (e.g. in CI), controller marks order completed and redirects to orders
        $this->assertSame('completed', $order->status);
        $this->assertSame('99.99', (string) $order->total);
        $this->assertCount(1, $order->items);
        $this->assertSame(0, $user->cartItems()->count());

        $response->assertRedirect(route('orders.index'));
    }
}
