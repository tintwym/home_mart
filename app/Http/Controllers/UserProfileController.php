<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserProfileController extends Controller
{
    public function show(Request $request, User $user): Response
    {
        $listings = $user->listings()
            ->with(['category', 'user:id,name,seller_type,region'])
            ->latest()
            ->get();

        $listingIds = $listings->pluck('id');
        $reviewCount = \App\Models\Review::whereIn('listing_id', $listingIds)->whereNull('parent_id')->count();
        $averageRating = (float) \App\Models\Review::whereIn('listing_id', $listingIds)->whereNull('parent_id')->avg('rating');

        return Inertia::render('users/show', [
            'user' => $user->only(['id', 'name', 'seller_type', 'region']),
            'listings' => $listings,
            'averageRating' => round($averageRating, 1),
            'reviewCount' => $reviewCount,
        ]);
    }
}
