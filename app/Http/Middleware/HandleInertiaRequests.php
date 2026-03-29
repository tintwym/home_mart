<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Message;
use App\Services\RegionFromIp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $locale = app()->getLocale();
        $path = lang_path($locale.'.json');
        $loadTranslations = function () use ($path) {
            if (! file_exists($path)) {
                return [];
            }
            $decoded = json_decode((string) file_get_contents($path), true);

            return is_array($decoded) ? $decoded : [];
        };

        if (app()->environment('local')) {
            $translations = $loadTranslations();
        } else {
            $cacheKey = 'translations.'.$locale.(file_exists($path) ? '.'.filemtime($path) : '');
            $translations = Cache::remember($cacheKey, now()->addDays(1), $loadTranslations);
        }

        $user = $request->user();
        $cartItems = $user
            ? rescue(fn () => $user->cartItems()->get(['listing_id']), null, report: false)
            : null;
        $cartCount = $cartItems ? $cartItems->count() : 0;
        $cartListingIds = $cartItems ? $cartItems->pluck('listing_id')->toArray() : [];
        $chatUnreadCount = $user
            ? (int) rescue(
                fn () => Cache::remember(
                    "chat.unread.{$user->id}",
                    now()->addSeconds(15),
                    fn () => Message::query()
                        ->whereNull('read_at')
                        ->where('user_id', '!=', $user->id)
                        ->whereHas('conversation', function ($q) use ($user) {
                            $q->where('buyer_id', $user->id)
                                ->orWhereHas('listing', fn ($lq) => $lq->where('user_id', $user->id));
                        })
                        ->count()
                ),
                0,
                report: false
            )
            : 0;

        $region = RegionFromIp::detect($request);
        $currencies = config('shop.currencies', []);
        $defaultCurrency = config('shop.default_currency', ['code' => 'USD', 'symbol' => '$', 'decimals' => 2]);
        $currency = $currencies[$region] ?? $defaultCurrency;
        $regionLabels = ['SG' => 'Singapore', 'MM' => 'Myanmar', 'US' => 'United States'];
        $regionLabel = $regionLabels[$region] ?? 'All';
        $locations = config('shop.locations', []);
        $locationsResolved = ! empty($locations)
            ? array_map(fn ($loc) => is_array($loc) ? $loc : ['name' => $loc, 'lat' => null, 'lng' => null], $locations)
            : (config('shop.regions', [])[$region] ?? config('shop.regions', [])[config('shop.default_region', 'MM')] ?? []);

        return [
            ...parent::share($request),
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'name' => config('app.name'),
            'locale' => $locale,
            'translations' => $translations,
            'auth' => [
                'user' => $user,
                'cartCount' => $cartCount,
                'cartListingIds' => $cartListingIds,
                'chatUnreadCount' => $chatUnreadCount,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'categories' => rescue(
                fn () => Cache::remember(
                    'categories.sidebar',
                    now()->addHour(),
                    fn () => Category::orderBy('name')->get(['id', 'name', 'slug'])
                ),
                collect(),
                report: false
            ),
            'locations' => $locationsResolved,
            'regionLabel' => $regionLabel,
            'region' => $region,
            'currency' => $currency,
            'currencies' => $currencies,
        ];
    }
}
