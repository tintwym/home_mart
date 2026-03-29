<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\PaymentController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SettingsMenuController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::get('settings', [SettingsMenuController::class, 'index'])->name('settings.index');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/orders', function (\Illuminate\Http\Request $request) {
        $orders = $request->user()
            ->orders()
            ->where('status', 'paid')
            ->with(['items.listing:id,title,image_path,price,user_id', 'items.listing.user:id,region'])
            ->latest()
            ->get();

        return Inertia::render('settings/orders', [
            'orders' => $orders,
        ]);
    })->name('orders.index');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    Route::get('settings/payment', [PaymentController::class, 'index'])->name('payment.index');
    Route::post('settings/payment', [PaymentController::class, 'store'])->name('payment.store');
    Route::post('settings/payment/setup-intent', [PaymentController::class, 'createSetupIntent'])->name('payment.setup-intent');
    Route::post('settings/payment/default', [PaymentController::class, 'setDefault'])->name('payment.set-default');
    Route::delete('settings/payment/{paymentMethodId}', [PaymentController::class, 'destroy'])->name('payment.destroy');
});
