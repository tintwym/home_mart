<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\UpgradeController;
use App\Models\Category;
use App\Models\Listing;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

// Serve listing images from storage when public disk is used (works without storage:link)
Route::get('/storage/listings/{path}', function (string $path) {
    $path = 'listings/'.ltrim($path, '/');
    if (str_contains($path, '..') || config('filesystems.listing_disk') !== 'public') {
        abort(404);
    }
    if (! Storage::disk('public')->exists($path)) {
        abort(404);
    }

    return response()->file(Storage::disk('public')->path($path), [
        'Content-Type' => Storage::disk('public')->mimeType($path) ?: 'application/octet-stream',
    ]);
})->where('path', '.*')->name('storage.listings');

// Locale switcher (store in session, redirect back)
Route::post('/locale', function (\Illuminate\Http\Request $request) {
    $locale = $request->input('locale');
    if (in_array($locale, ['en', 'zh', 'my'], true)) {
        Session::put('locale', $locale);
    }

    return redirect()->back();
})->name('locale');

// Dashboard is the default page (public; login/register in navbar for guests)
Route::get('/', function (\Illuminate\Http\Request $request) {
    $query = Listing::with(['category', 'user:id,name,seller_type,region'])
        ->orderByTrendingFirst();

    if ($q = $request->query('q')) {
        $query->where(function ($qry) use ($q) {
            $qry->where('title', 'like', '%'.$q.'%')
                ->orWhere('description', 'like', '%'.$q.'%');
        });
    }

    $listings = rescue(
        fn () => $query->take(100)->get(),
        collect(),
        report: true
    );

    return Inertia::render('dashboard', [
        'listings' => $listings,
        'searchQuery' => $request->query('q', ''),
    ]);
})->name('dashboard');

// Redirect old dashboard URL to root (listings dashboard)
Route::redirect('/dashboard', '/');

// Legacy /home → same as dashboard
Route::redirect('/home', '/')->name('home');

// Download / get app (Play Store + optional sideload APK + optional iOS link)
Route::get('/download', function () {
    $apkPath = public_path('downloads/homemart.apk');
    $apkAvailable = File::exists($apkPath);
    $iosStoreUrl = config('app.ios_store_url', '');
    $playStoreUrl = config('app.android_play_store_url', '');

    return Inertia::render('download', [
        'playStoreUrl' => $playStoreUrl !== '' ? $playStoreUrl : null,
        'apkAvailable' => $apkAvailable,
        'apkUrl' => $apkAvailable ? asset('downloads/homemart.apk') : null,
        'iosStoreUrl' => $iosStoreUrl !== '' ? $iosStoreUrl : null,
    ]);
})->name('download');

// Category page: browse listings by category
Route::get('/categories/{slug}', function (string $slug) {
    $category = Category::where('slug', $slug)->firstOrFail();
    $listings = Listing::with(['category', 'user:id,name,seller_type,region'])
        ->where('category_id', $category->id)
        ->orderByTrendingFirst()
        ->get();

    return Inertia::render('categories/show', [
        'category' => $category,
        'listings' => $listings,
    ]);
})->name('categories.show');

// Listings CRUD - define /create and /{listing}/edit before /{listing} so they aren't matched as listing ID
Route::middleware(['auth'])->group(function () {
    Route::get('listings/create', [ListingController::class, 'create'])->name('listings.create');
    Route::get('listings/{listing}/edit', [ListingController::class, 'edit'])->name('listings.edit');
});

Route::get('listings/{listing}', [ListingController::class, 'show'])->name('listings.show');
Route::post('listings/{listing}/reviews', [ReviewController::class, 'store'])->name('listings.reviews.store')->middleware('auth');
Route::post('listings/{listing}/chat', [ChatController::class, 'store'])->name('listings.chat.store')->middleware('auth');

Route::middleware(['auth'])->group(function () {
    Route::get('upgrades', [UpgradeController::class, 'index'])->name('upgrades.index');
    Route::post('upgrades/slots', [UpgradeController::class, 'purchaseSlots'])->name('upgrades.slots');
    Route::post('listings/{listing}/promote', [ListingController::class, 'promote'])->name('listings.promote');
    Route::get('checkout/promote/success', [ListingController::class, 'promoteSuccess'])->name('listings.promote.success');
    Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('chat/{conversation}', [ChatController::class, 'show'])->name('chat.show');
    Route::get('chat/{conversation}/messages/since', [ChatController::class, 'messagesSince'])->name('chat.messages.since');
    Route::get('chat/{conversation}/typing', [ChatController::class, 'typingStatus'])->name('chat.typing.status');
    Route::post('chat/{conversation}/messages', [ChatController::class, 'sendMessage'])->name('chat.messages.store');
    Route::post('chat/{conversation}/typing', [ChatController::class, 'typing'])->name('chat.typing');
    Route::get('cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
    Route::match(['get', 'post'], 'checkout/2c2p/return', [CheckoutController::class, 'twoC2pReturn'])
        ->name('checkout.twoc2p.return');
    Route::post('listings/{listing}/cart', [CartController::class, 'store'])->name('listings.cart.store');
    Route::delete('listings/{listing}/cart', [CartController::class, 'destroy'])->name('listings.cart.destroy');
    Route::resource('listings', ListingController::class)->except(['index', 'show', 'create', 'edit']);
});

// 2C2P backend notification (no session / CSRF — validated via JWT in controller)
Route::post('checkout/2c2p/callback', [CheckoutController::class, 'twoC2pCallback'])
    ->name('checkout.twoc2p.callback');

require __DIR__.'/settings.php';
