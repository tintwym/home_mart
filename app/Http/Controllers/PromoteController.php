<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PromoteController extends Controller
{
    public function store(Request $request, Listing $listing): RedirectResponse
    {
        $this->authorize('update', $listing);

        $days = config('shop.trend_duration_days', 7);
        $listing->update([
            'trending_until' => now()->addDays($days),
        ]);

        return back()->with('status', 'Your listing is now trending!');
    }
}
