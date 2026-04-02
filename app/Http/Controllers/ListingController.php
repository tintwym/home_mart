<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreListingRequest;
use App\Http\Requests\UpdateListingRequest;
use App\Models\Listing;
use App\Models\Subcategory;
use App\Services\CloudinaryService;
use App\Services\RegionFromIp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;

class ListingController extends Controller
{
    public function show(Listing $listing): Response
    {
        $listing->load(['category', 'user:id,name,seller_type,region', 'reviews' => fn ($q) => $q->with('user:id,name')->latest()]);

        $currency = $this->currencyForRequest(request());
        $trendPrice = config('shop.trend_price', 10);
        $trendDays = config('shop.trend_duration_days', 7);

        $relatedListings = Listing::with(['category', 'user:id,name,seller_type,region'])
            ->where('subcategory_id', $listing->subcategory_id)
            ->where('id', '!=', $listing->id)
            ->latest()
            ->limit(6)
            ->get();

        return Inertia::render('listings/show', [
            'listing' => $listing,
            'averageRating' => round((float) $listing->reviews->avg('rating'), 1),
            'reviewCount' => $listing->reviews->count(),
            'trendPriceLabel' => $currency['symbol'].$trendPrice.' for '.$trendDays.' days',
            'trendDurationDays' => $trendDays,
            'relatedListings' => $relatedListings,
        ]);
    }

    public function index(Request $request): Response
    {
        $listings = Listing::with(['category', 'user:id,name,seller_type,region'])
            ->latest()
            ->paginate(12);

        return Inertia::render('listings/index', [
            'listings' => $listings,
        ]);
    }

    public function create(): Response
    {
        $user = request()->user();
        $listingCount = $user->listingCount();
        $maxSlots = $user->maxListingSlots();
        $currency = $this->currencyForRequest(request());
        $slotPrice = config('shop.slot_price', 5);

        return Inertia::render('listings/create', [
            'subcategories' => Subcategory::query()
                ->with(['category:id,name,slug'])
                ->orderBy('name')
                ->get(['id', 'category_id', 'name', 'slug']),
            'listingCount' => $listingCount,
            'maxListingSlots' => $maxSlots,
            'canCreate' => $user->canCreateListing(),
            'slotPrice' => $slotPrice,
            'slotPriceLabel' => $currency['symbol'].$slotPrice.' per slot',
        ]);
    }

    public function store(StoreListingRequest $request): RedirectResponse
    {
        $this->authorize('create', Listing::class);

        $data = $request->validated();
        $imagePath = null;

        $listingDisk = config('filesystems.listing_disk', 'public');
        if ($request->hasFile('image')) {
            try {
                if ($listingDisk === 'cloudinary') {
                    $imagePath = CloudinaryService::upload($request->file('image'), 'listings');
                } else {
                    $imagePath = $request->file('image')->store('listings', $listingDisk);
                }
            } catch (\Throwable $e) {
                return redirect()->back()->withErrors(['image' => $e->getMessage()])->withInput();
            }
        } else {
            return redirect()->back()->withErrors(['image' => __('listing.image_required_message')])->withInput();
        }

        Listing::create([
            'user_id' => $request->user()->id,
            'subcategory_id' => $data['subcategory_id'],
            'title' => $data['title'],
            'description' => $data['description'],
            'condition' => $data['condition'],
            'price' => $data['price'],
            'image_path' => $imagePath,
            'meetup_location' => $data['meetup_location'] ?? null,
        ]);

        return redirect()->route('dashboard')->with('status', 'Listing created.');
    }

    public function edit(Listing $listing): Response|RedirectResponse
    {
        $this->authorize('update', $listing);

        return Inertia::render('listings/edit', [
            'listing' => $listing->load(['category.category']),
            'subcategories' => Subcategory::query()
                ->with(['category:id,name,slug'])
                ->orderBy('name')
                ->get(['id', 'category_id', 'name', 'slug']),
        ]);
    }

    public function update(UpdateListingRequest $request, Listing $listing): RedirectResponse
    {
        $data = $request->validated();
        $imagePath = $listing->image_path;

        $listingDisk = config('filesystems.listing_disk', 'public');
        if ($request->hasFile('image')) {
            if ($listing->image_path && str_contains($listing->image_path, 'res.cloudinary.com')) {
                CloudinaryService::deleteByUrl($listing->image_path);
            } elseif ($listing->image_path && $listingDisk !== 'cloudinary') {
                $oldPath = str_starts_with($listing->image_path, '/storage/')
                    ? substr($listing->image_path, 9)
                    : $listing->image_path;
                Storage::disk($listingDisk)->delete($oldPath);
            }
            try {
                if ($listingDisk === 'cloudinary') {
                    $imagePath = CloudinaryService::upload($request->file('image'), 'listings');
                } else {
                    $imagePath = $request->file('image')->store('listings', $listingDisk);
                }
            } catch (\Throwable $e) {
                return redirect()->back()->withErrors(['image' => $e->getMessage()])->withInput();
            }
        }

        $listing->update([
            'subcategory_id' => $data['subcategory_id'],
            'title' => $data['title'],
            'description' => $data['description'],
            'condition' => $data['condition'],
            'price' => $data['price'],
            'image_path' => $imagePath,
            'meetup_location' => $data['meetup_location'] ?? null,
        ]);

        return redirect()->route('dashboard')->with('status', 'Listing updated.');
    }

    public function destroy(Request $request, Listing $listing): RedirectResponse
    {
        $this->authorize('delete', $listing);

        if ($listing->image_path) {
            if (str_contains($listing->image_path, 'res.cloudinary.com')) {
                CloudinaryService::deleteByUrl($listing->image_path);
            } else {
                $listingDisk = config('filesystems.listing_disk', 'public');
                $path = str_starts_with($listing->image_path, '/storage/')
                    ? substr($listing->image_path, 9)
                    : $listing->image_path;
                Storage::disk($listingDisk)->delete($path);
            }
        }
        $listing->delete();

        return redirect()->route('dashboard')->with('status', 'Listing deleted.');
    }

    /**
     * Start promote checkout: create Stripe session for trend price ($10), redirect to Stripe.
     * After payment, user is sent to promoteSuccess which sets trending_until.
     */
    public function promote(Request $request, Listing $listing): RedirectResponse
    {
        $this->authorize('update', $listing);

        $days = config('shop.trend_duration_days', 7);
        $amount = (float) config('shop.trend_price', 10);
        $secret = config('services.stripe.secret');

        if (! $secret) {
            return redirect()
                ->route('listings.show', $listing)
                ->with('error', 'Payment is not configured. Please try again later.');
        }

        try {
            Stripe::setApiKey($secret);
            $session = StripeSession::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => 'Promote listing: '.$listing->title,
                            'description' => "Make this listing trend for {$days} days (appears higher in search).",
                        ],
                        'unit_amount' => (int) round($amount * 100),
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => route('listings.promote.success').'?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('listings.show', $listing),
                'metadata' => [
                    'listing_id' => $listing->id,
                    'type' => 'promote',
                ],
            ]);
        } catch (ApiErrorException $e) {
            return redirect()
                ->route('listings.show', $listing)
                ->with('error', 'Could not start checkout. Please try again.');
        }

        return redirect()->away($session->url);
    }

    /**
     * After successful Stripe payment for promote: set listing trending_until and redirect.
     */
    public function promoteSuccess(Request $request): RedirectResponse
    {
        $sessionId = $request->query('session_id');
        if (! $sessionId) {
            return redirect()->route('dashboard')->with('error', 'Invalid checkout session.');
        }

        $secret = config('services.stripe.secret');
        if (! $secret) {
            return redirect()->route('dashboard')->with('error', 'Payment configuration error.');
        }

        Stripe::setApiKey($secret);
        try {
            $session = StripeSession::retrieve($sessionId);
        } catch (ApiErrorException) {
            return redirect()->route('dashboard')->with('error', 'Invalid checkout session.');
        }

        if (($session->payment_status ?? '') !== 'paid') {
            return redirect()->route('dashboard')->with('error', 'Payment was not completed.');
        }

        $listingId = $session->metadata->listing_id ?? null;
        $type = $session->metadata->type ?? null;
        if (! $listingId || $type !== 'promote') {
            return redirect()->route('dashboard')->with('error', 'Invalid session.');
        }

        $listing = Listing::find($listingId);
        if (! $listing || $listing->user_id !== $request->user()->id) {
            return redirect()->route('dashboard')->with('error', 'Listing not found or access denied.');
        }

        $days = config('shop.trend_duration_days', 7);
        $listing->update([
            'trending_until' => now()->addDays($days),
        ]);

        return redirect()
            ->route('listings.show', $listing)
            ->with('status', "Listing promoted for {$days} days. It will appear higher in search.");
    }

    /** @return array{code: string, symbol: string, decimals: int} */
    private function currencyForRequest(Request $request): array
    {
        $region = RegionFromIp::detect($request);
        $currencies = config('shop.currencies', []);
        $default = config('shop.default_currency', ['code' => 'USD', 'symbol' => '$', 'decimals' => 2]);

        return $currencies[$region] ?? $default;
    }
}
