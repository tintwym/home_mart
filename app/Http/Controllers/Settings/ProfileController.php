<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Services\RegionFromIp;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\Customer as StripeCustomer;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentMethod;
use Stripe\Stripe;

class ProfileController extends Controller
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
        } catch (ApiErrorException $e) {
            Log::warning('Stripe customer create failed: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $region = RegionFromIp::detect($request);
        $isMyanmar = $region === 'MM';
        $paymentMethods = [];
        $stripePublishableKey = null;

        if (! $isMyanmar) {
            $key = config('services.stripe.key');
            $secret = config('services.stripe.secret');
            if ($key && $secret) {
                $stripePublishableKey = $key;
                $customerId = $this->getOrCreateStripeCustomerId($request->user());
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
                            } catch (ApiErrorException) {
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

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'paymentMethods' => $paymentMethods,
            'stripePublishableKey' => $stripePublishableKey,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
