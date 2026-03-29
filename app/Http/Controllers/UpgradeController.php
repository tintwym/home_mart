<?php

namespace App\Http\Controllers;

use App\Services\RegionFromIp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UpgradeController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $listingCount = $user->listingCount();
        $maxSlots = $user->maxListingSlots();
        $currency = $this->currencyForRequest($request);
        $slotPrice = config('shop.slot_price', 5);
        $trendPrice = config('shop.trend_price', 10);
        $trendDays = config('shop.trend_duration_days', 7);

        return Inertia::render('upgrades/index', [
            'listingCount' => $listingCount,
            'maxListingSlots' => $maxSlots,
            'slotPrice' => $slotPrice,
            'slotPriceLabel' => $currency['symbol'].$slotPrice.' per slot',
            'trendPrice' => $trendPrice,
            'trendPriceLabel' => $currency['symbol'].$trendPrice.' for '.$trendDays.' days',
            'trendDurationDays' => $trendDays,
        ]);
    }

    public function purchaseSlots(Request $request): RedirectResponse
    {
        $user = $request->user();
        $user->increment('extra_listing_slots');

        return redirect()
            ->route('upgrades.index')
            ->with('status', 'Extra slot purchased. You can now list one more item.');
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
