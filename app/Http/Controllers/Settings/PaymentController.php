<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TwoC2pService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\Customer as StripeCustomer;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentMethod;
use Stripe\SetupIntent;
use Stripe\Stripe;

class PaymentController extends Controller
{
    protected function getOrCreateStripeCustomerId(User $user): ?string
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
        } catch (ApiErrorException $e) {
            Log::warning('Stripe customer create failed: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Show payment methods page (2C2P info for Myanmar; Stripe cards for all other regions).
     */
    public function index(Request $request, TwoC2pService $twoC2p): Response|RedirectResponse
    {
        $region = \App\Services\RegionFromIp::detect($request);
        $isMyanmar = $region === 'MM';
        $user = $request->user();

        $paymentMethods = [];
        $stripePublishableKey = null;

        if (! $isMyanmar) {
            $key = config('services.stripe.key');
            $secret = config('services.stripe.secret');
            if ($key && $secret) {
                $stripePublishableKey = $key;
                $customerId = $this->getOrCreateStripeCustomerId($user);
                if ($customerId) {
                    try {
                        Stripe::setApiKey($secret);
                        $customer = StripeCustomer::retrieve($customerId);
                        $defaultPmId = $customer->invoice_settings->default_payment_method ?? null;

                        $pms = PaymentMethod::all([
                            'customer' => $customerId,
                            'type' => 'card',
                        ]);

                        if (! $defaultPmId && count($pms->data) > 0) {
                            $defaultPmId = $pms->data[0]->id;
                            try {
                                StripeCustomer::update($customerId, [
                                    'invoice_settings' => [
                                        'default_payment_method' => $defaultPmId,
                                    ],
                                ]);
                            } catch (ApiErrorException $e) {
                                // ignore
                            }
                        }

                        foreach ($pms->data as $pm) {
                            $paymentMethods[] = [
                                'id' => $pm->id,
                                'brand' => $pm->card->brand ?? 'card',
                                'last4' => $pm->card->last4 ?? '****',
                                'is_default' => $pm->id === $defaultPmId,
                            ];
                        }
                    } catch (ApiErrorException $e) {
                        Log::warning('Stripe list payment methods failed: '.$e->getMessage());
                    }
                }
            }
        }

        return Inertia::render('settings/payment', [
            'region' => $region,
            'paymentMethods' => $paymentMethods,
            'stripePublishableKey' => $stripePublishableKey,
            'twoC2pConfigured' => $isMyanmar && $twoC2p->isConfigured(),
            'flash' => [
                'status' => $request->session()->get('status'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }

    /**
     * Legacy route: Myanmar checkout uses 2C2P only (hosted page), not saved local wallet rows.
     */
    public function store(Request $request): RedirectResponse
    {
        $region = \App\Services\RegionFromIp::detect($request);
        if ($region === 'MM') {
            return redirect()->route('payment.index')->with(
                'error',
                'Myanmar checkout uses 2C2P on the cart page. Cards and wallets are not saved here.'
            );
        }

        return redirect()->route('payment.index')->with('error', 'Invalid request.');
    }

    /**
     * Create a SetupIntent for adding a new card; return client_secret.
     */
    public function createSetupIntent(Request $request): JsonResponse
    {
        $region = \App\Services\RegionFromIp::detect($request);
        if ($region === 'MM') {
            return response()->json(['error' => 'Card vault is not used for Myanmar (2C2P at checkout).'], 403);
        }

        $secret = config('services.stripe.secret');
        if (! $secret) {
            return response()->json(['error' => 'Stripe is not configured.'], 503);
        }

        $user = $request->user();
        $customerId = $this->getOrCreateStripeCustomerId($user);
        if (! $customerId) {
            return response()->json(['error' => 'Could not create payment profile.'], 503);
        }

        try {
            Stripe::setApiKey($secret);
            $intent = SetupIntent::create([
                'customer' => $customerId,
                'usage' => 'off_session',
            ]);

            return response()->json(['clientSecret' => $intent->client_secret]);
        } catch (ApiErrorException $e) {
            Log::warning('Stripe SetupIntent create failed: '.$e->getMessage());

            return response()->json(['error' => 'Could not start add card.'], 503);
        }
    }

    /**
     * Set default payment method (Stripe card only).
     */
    public function setDefault(Request $request): RedirectResponse
    {
        $request->validate(['payment_method_id' => 'required|string']);
        $user = $request->user();
        $id = $request->payment_method_id;

        if (! str_starts_with($id, 'pm_')) {
            return redirect()->route('payment.index')->with('error', 'Invalid payment method.');
        }

        if (! $user->stripe_customer_id) {
            return redirect()->route('payment.index')->with('error', 'No payment profile found.');
        }
        $secret = config('services.stripe.secret');
        if (! $secret) {
            return redirect()->route('payment.index')->with('error', 'Stripe is not configured.');
        }
        try {
            Stripe::setApiKey($secret);
            StripeCustomer::update($user->stripe_customer_id, [
                'invoice_settings' => ['default_payment_method' => $id],
            ]);

            return redirect()->route('payment.index')->with('status', 'Default card updated.');
        } catch (ApiErrorException $e) {
            Log::warning('Stripe set default payment method failed: '.$e->getMessage());

            return redirect()->route('payment.index')->with('error', 'Could not set default card.');
        }
    }

    /**
     * Detach (delete) a Stripe payment method.
     */
    public function destroy(Request $request, string $paymentMethodId): RedirectResponse
    {
        $user = $request->user();

        if (! str_starts_with($paymentMethodId, 'pm_')) {
            return redirect()->route('payment.index')->with('error', 'Invalid payment method.');
        }

        if (! $user->stripe_customer_id) {
            return redirect()->route('payment.index')->with('error', 'No payment profile found.');
        }
        $secret = config('services.stripe.secret');
        if (! $secret) {
            return redirect()->route('payment.index')->with('error', 'Stripe is not configured.');
        }
        try {
            Stripe::setApiKey($secret);
            $pm = PaymentMethod::retrieve($paymentMethodId);
            if ($pm->customer !== $user->stripe_customer_id) {
                return redirect()->route('payment.index')->with('error', 'Invalid payment method.');
            }
            $pm->detach();

            return redirect()->route('payment.index')->with('status', 'Card removed.');
        } catch (ApiErrorException $e) {
            Log::warning('Stripe detach payment method failed: '.$e->getMessage());

            return redirect()->route('payment.index')->with('error', 'Could not remove card.');
        }
    }
}
