<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Notifications\NewFavoriteNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FavoriteController extends Controller
{
    public function index(Request $request): Response
    {
        $listings = $request->user()
            ->favorites()
            ->with(['category', 'user:id,name,seller_type,region'])
            ->latest('favorites.created_at')
            ->get();

        return Inertia::render('favorites/index', [
            'listings' => $listings,
        ]);
    }

    public function store(Request $request, Listing $listing): RedirectResponse
    {
        $user = $request->user();
        $wasNew = $user->favorites()->syncWithoutDetaching([$listing->id])['attached'];
        if ($wasNew && $listing->user_id !== $user->id) {
            $listing->user->notify(new NewFavoriteNotification($listing, $user));
        }

        return back()->with('status', 'Added to favorites.');
    }

    public function destroy(Request $request, Listing $listing): RedirectResponse
    {
        $request->user()->favorites()->detach($listing->id);

        return back()->with('status', 'Removed from favorites.');
    }
}
