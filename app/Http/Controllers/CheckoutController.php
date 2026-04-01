<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\RegionFromIp;
use App\Services\TwoC2pService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\View\View;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;

class CheckoutController extends Controller
{
    public function store(Request $request, TwoC2pService $twoC2p): RedirectResponse|View
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
            return $this->checkoutMyanmar($twoC2p, $user, $order, $cartItems, $total);
        }

        return $this->checkoutStripe($user, $order, $cartItems);
    }

    /**
     * Myanmar: 2C2P hosted payment page (cards, MPU, APM). Unconfigured gateway skips payment like missing Stripe.
     */
    protected function checkoutMyanmar(
        TwoC2pService $twoC2p,
        $user,
        Order $order,
        $cartItems,
        float $total
    ): RedirectResponse|View {
        if (! $twoC2p->isConfigured()) {
            $user->cartItems()->delete();
            $order->update(['status' => 'completed']);

            return redirect()->route('orders.index')->with(
                'status',
                'Order placed. Add C2C2P_MERCHANT_ID and C2C2P_SECRET_KEY to .env for 2C2P payment.'
            );
        }

        $currency = config('shop.currencies.MM.code', 'MMK');
        $description = 'Order '.$order->id;
        $frontendReturnUrl = route('checkout.twoc2p.return', [], true);
        $backendReturnUrl = route('checkout.twoc2p.callback', [], true);

        $tokenData = $twoC2p->createPaymentToken(
            $order->id,
            $total,
            $currency,
            $description,
            $frontendReturnUrl,
            $backendReturnUrl,
            $order->id
        );

        if ($tokenData === null || ($tokenData['webPaymentUrl'] ?? '') === '' || ($tokenData['paymentToken'] ?? '') === '') {
            $order->delete();

            return redirect()->route('cart.index')->with(
                'error',
                'Payment could not be started. Check your 2C2P configuration or try again.'
            );
        }

        $order->update(['payment_gateway' => '2c2p']);
        $user->cartItems()->delete();

        return view('checkout.twoc2p-redirect', [
            'webPaymentUrl' => $tokenData['webPaymentUrl'],
            'paymentToken' => $tokenData['paymentToken'],
        ]);
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

    /**
     * Browser return after 2C2P hosted page (GET or POST with paymentResponse).
     */
    public function twoC2pReturn(Request $request, TwoC2pService $twoC2p): RedirectResponse
    {
        $paymentResponse = (string) $request->input('paymentResponse', '');
        $decoded = $twoC2p->decodeFrontendPaymentResponse($paymentResponse);

        if ($decoded === null) {
            return redirect()->route('orders.index')->with('error', 'Invalid payment response from 2C2P.');
        }

        $invoiceNo = (string) ($decoded['invoiceNo'] ?? '');

        if ($invoiceNo === '' || ! $twoC2p->isFrontendPaymentSuccessful($decoded)) {
            return redirect()->route('orders.index')->with(
                'error',
                'Payment was not completed. You can try again from your cart.'
            );
        }

        $updated = Order::where('id', $invoiceNo)
            ->where('user_id', $request->user()->id)
            ->where('payment_gateway', '2c2p')
            ->where('status', 'pending')
            ->update(['status' => 'paid']);

        if ($updated === 0) {
            return redirect()->route('orders.index')->with(
                'status',
                'If you completed payment, your order will appear shortly. Otherwise try again from the cart.'
            );
        }

        return redirect()->route('orders.index')->with('status', 'Payment successful. Thank you!');
    }

    /**
     * 2C2P server-to-server notification (JSON body with JWT payload).
     */
    public function twoC2pCallback(Request $request, TwoC2pService $twoC2p): Response
    {
        if (! $twoC2p->isConfigured()) {
            return response('Not configured', 503);
        }

        $payload = $request->input('payload');
        if (! is_string($payload) || $payload === '') {
            return response('Bad request', 400);
        }

        $decoded = $twoC2p->decodePayload($payload);
        if ($decoded === null || ! $twoC2p->isBackendPaymentSuccessful($decoded)) {
            return response('Ignored', 200);
        }

        $invoiceNo = (string) ($decoded['invoiceNo'] ?? '');
        if ($invoiceNo === '') {
            return response('Bad request', 400);
        }

        Order::where('id', $invoiceNo)
            ->where('payment_gateway', '2c2p')
            ->where('status', 'pending')
            ->update(['status' => 'paid']);

        return response('OK', 200);
    }
}
