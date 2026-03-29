<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\LocalPaymentMethod;
use App\Models\User;
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
     * Show payment methods page (Stripe cards for Singapore, local methods for Myanmar).
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $region = \App\Services\RegionFromIp::detect($request);
        $isSingapore = $region === 'SG';
        $isMyanmar = $region === 'MM';
        $user = $request->user();

        $paymentMethods = [];
        $stripePublishableKey = null;
        $myanmarMethods = [];

        if ($isMyanmar) {
            $myanmarMethods = $user->localPaymentMethods()
                ->orderByDesc('is_default')
                ->orderBy('created_at')
                ->get()
                ->map(fn (LocalPaymentMethod $m) => [
                    'id' => $m->id,
                    'type' => $m->type,
                    'type_label' => $m->type_label,
                    'identifier' => $m->identifier,
                    'identifier_masked' => strlen($m->identifier) > 4
                        ? '****'.substr($m->identifier, -4)
                        : '****'.$m->identifier,
                    'is_default' => $m->is_default,
                ])
                ->all();
        }

        if ($isSingapore) {
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
            'myanmarMethods' => $myanmarMethods,
            'myanmarTypes' => LocalPaymentMethod::typeLabels(),
            'flash' => [
                'status' => $request->session()->get('status'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }

    /**
     * Store a Myanmar local payment method (MPU, KBZ Pay, AYA Pay, Wave Pay, CB Pay).
     */
    public function store(Request $request): RedirectResponse
    {
        $region = \App\Services\RegionFromIp::detect($request);
        if ($region !== 'MM') {
            return redirect()->route('payment.index')->with('error', 'Local payment methods are only available for Myanmar.');
        }

        $valid = $request->validate([
            'type' => ['required', 'string', 'in:mpu,kbz_pay,aya_pay,wave_pay,cb_pay'],
            'identifier' => ['required', 'string', 'max:50'],
        ]);

        $user = $request->user();
        $isFirst = $user->localPaymentMethods()->count() === 0;

        $user->localPaymentMethods()->create([
            'type' => $valid['type'],
            'identifier' => $valid['identifier'],
            'is_default' => $isFirst,
        ]);

        return redirect()->route('payment.index')->with('status', 'Payment method added.');
    }

    /**
     * Create a SetupIntent for adding a new card; return client_secret.
     */
    public function createSetupIntent(Request $request): JsonResponse
    {
        $region = \App\Services\RegionFromIp::detect($request);
        if ($region !== 'SG') {
            return response()->json(['error' => 'Payment methods only available for Singapore.'], 403);
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
     * Set default payment method (Stripe card for Singapore, local method for Myanmar).
     */
    public function setDefault(Request $request): RedirectResponse
    {
        $request->validate(['payment_method_id' => 'required|string']);
        $user = $request->user();
        $id = $request->payment_method_id;

        if (str_starts_with($id, 'pm_')) {
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

        $local = $user->localPaymentMethods()->find($id);
        if (! $local) {
            return redirect()->route('payment.index')->with('error', 'Invalid payment method.');
        }
        $user->localPaymentMethods()->update(['is_default' => false]);
        $local->update(['is_default' => true]);

        return redirect()->route('payment.index')->with('status', 'Default payment method updated.');
    }

    /**
     * Detach (delete) a payment method (Stripe or Myanmar local).
     */
    public function destroy(Request $request, string $paymentMethodId): RedirectResponse
    {
        $user = $request->user();

        if (str_starts_with($paymentMethodId, 'pm_')) {
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

        $local = $user->localPaymentMethods()->find($paymentMethodId);
        if (! $local) {
            return redirect()->route('payment.index')->with('error', 'Invalid payment method.');
        }
        $local->delete();
        $newDefault = $user->localPaymentMethods()->first();
        if ($newDefault && ! $user->localPaymentMethods()->where('is_default', true)->exists()) {
            $newDefault->update(['is_default' => true]);
        }

        return redirect()->route('payment.index')->with('status', 'Payment method removed.');
    }
}
