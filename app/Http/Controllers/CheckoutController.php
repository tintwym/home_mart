<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\RegionFromIp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Customer as StripeCustomer;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;

class CheckoutController extends Controller
{
    protected function getOrCreateStripeCustomerId($user): ?string
    {
        if ($user->stripe_customer_id) {
            return $user->stripe_customer_id;
        }

        $secret = config('services.stripe.secret');
        if (! $secret) {
            return null;
        }

        try {
            Stripe::setApiKey($secret);
            $customer = StripeCustomer::create([
                'email' => $user->email,
                'name' => $user->name,
            ]);
            $user->update(['stripe_customer_id' => $customer->id]);

            return $customer->id;
        } catch (ApiErrorException) {
            return null;
        }
    }

    public function store(Request $request): RedirectResponse|InertiaResponse
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

        $region = RegionFromIp::detect($request);

        if ($region === 'MM') {
            return Inertia::render('checkout/myanmar', [
                'order' => $order->load(['items.listing:id,title,image_path,price,user_id']),
                'savedMethods' => $user->localPaymentMethods()
                    ->orderByDesc('is_default')
                    ->latest()
                    ->get()
                    ->map(fn ($pm) => [
                        'id' => $pm->id,
                        'type' => $pm->type,
                        'type_label' => $pm->type_label,
                        'identifier' => $pm->identifier,
                        'is_default' => (bool) $pm->is_default,
                    ])
                    ->all(),
            ]);
        }

        return $this->checkoutStripe($user, $order, $cartItems);
    }

    public function payMyanmar(Request $request): RedirectResponse
    {
        $user = $request->user();
        $region = RegionFromIp::detect($request);
        if ($region !== 'MM') {
            return redirect()->route('cart.index')->with('error', 'Invalid request.');
        }

        $validated = $request->validate([
            'order_id' => 'required|string',
            'method' => 'required|string|max:30',
            'identifier' => 'nullable|string|max:80',
            'save_method' => 'nullable|boolean',
        ]);

        /** @var Order|null $order */
        $order = Order::where('id', $validated['order_id'])
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (! $order) {
            return redirect()->route('cart.index')->with('error', 'Order not found.');
        }

        $method = $validated['method'];
        $identifier = trim((string) ($validated['identifier'] ?? ''));

        if (($validated['save_method'] ?? false)
            && $identifier !== ''
            && in_array($method, ['mpu', 'kbz_pay', 'aya_pay', 'wave_pay', 'cb_pay'], true)) {
            $exists = $user->localPaymentMethods()
                ->where('type', $method)
                ->where('identifier', $identifier)
                ->exists();
            if (! $exists) {
                $user->localPaymentMethods()->create([
                    'type' => $method,
                    'identifier' => $identifier,
                    'is_default' => $user->localPaymentMethods()->count() === 0,
                ]);
            }
        }

        $order->update([
            'payment_gateway' => 'mm_local',
            'payment_reference' => $method.($identifier !== '' ? ':'.$identifier : ''),
            'status' => 'paid',
        ]);

        $user->cartItems()->delete();

        return redirect()->route('orders.index')->with('status', 'Payment submitted. Thank you!');
    }

    /**
     * Non–Myanmar: Stripe Checkout.
     */
    protected function checkoutStripe($user, Order $order, $cartItems): RedirectResponse
    {
        $secret = config('services.stripe.secret');
        if (! $secret) {
            $user->cartItems()->delete();
            $order->update(['status' => 'completed']);

            return redirect()->route('orders.index')->with('status', 'Order placed. Add STRIPE_KEY and STRIPE_SECRET to .env for payment.');
        }

        try {
            Stripe::setApiKey($secret);
            $customerId = $this->getOrCreateStripeCustomerId($user);
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
                ...(is_string($customerId) ? ['customer' => $customerId] : []),
                'payment_intent_data' => [
                    // Save the card for future checkouts when possible.
                    'setup_future_usage' => 'off_session',
                ],
                'success_url' => route('checkout.success').'?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('cart.index'),
                'metadata' => ['order_id' => $order->id],
            ]);

            $order->update([
                'stripe_session_id' => $session->id,
                'payment_gateway' => 'stripe',
            ]);
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

    // 2C2P integration removed.
}
