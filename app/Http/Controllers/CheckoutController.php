<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;

class CheckoutController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $cartItems = $user->cartItems()->with('listing:id,title,price')->get();

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $total = $cartItems->sum(fn ($item) => (float) $item->listing->price);

        $order = Order::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'total' => $total,
        ]);

        foreach ($cartItems as $item) {
            $order->items()->create([
                'listing_id' => $item->listing_id,
                'quantity' => 1,
                'price' => $item->listing->price,
            ]);
        }

        $secret = config('services.stripe.secret');
        if (! $secret) {
            $user->cartItems()->delete();
            $order->update(['status' => 'completed']);

            return redirect()->route('orders.index')->with('status', 'Order placed. Add STRIPE_KEY and STRIPE_SECRET to .env for payment.');
        }

        try {
            Stripe::setApiKey($secret);
            $lineItems = $cartItems->map(fn ($item) => [
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => $item->listing->title,
                    ],
                    'unit_amount' => (int) round((float) $item->listing->price * 100),
                ],
                'quantity' => 1,
            ])->all();

            $session = StripeSession::create([
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => 'payment',
                'success_url' => route('checkout.success').'?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('cart.index'),
                'metadata' => ['order_id' => $order->id],
            ]);

            $order->update(['stripe_session_id' => $session->id]);
            $user->cartItems()->delete();

            return redirect()->away($session->url);
        } catch (ApiErrorException $e) {
            $order->update(['status' => 'completed']);
            $user->cartItems()->delete();

            return redirect()->route('orders.index')->with('status', 'Order placed. Payment could not be started – check your Stripe configuration.');
        }
    }

    public function success(Request $request): RedirectResponse
    {
        $sessionId = $request->query('session_id');
        if (! $sessionId) {
            return redirect()->route('cart.index')->with('error', 'Invalid checkout session.');
        }

        $secret = config('services.stripe.secret');
        if (! $secret) {
            return redirect()->route('orders.index')->with('status', 'Order complete.');
        }

        Stripe::setApiKey($secret);
        $session = StripeSession::retrieve($sessionId);
        $orderId = $session->metadata->order_id ?? null;

        if ($orderId) {
            Order::where('id', $orderId)
                ->where('user_id', $request->user()->id)
                ->update(['status' => 'paid']);
        }

        return redirect()->route('orders.index')->with('status', 'Payment successful. Thank you!');
    }
}
