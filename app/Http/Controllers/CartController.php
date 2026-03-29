<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(Request $request): Response
    {
        $items = $request->user()
            ->cartItems()
            ->with(['listing:id,title,image_path,price,user_id,condition', 'listing.user:id,name,region'])
            ->latest()
            ->get();

        return Inertia::render('cart/index', [
            'items' => $items,
        ]);
    }

    public function store(Request $request, Listing $listing): RedirectResponse
    {
        if ($listing->user_id === $request->user()->id) {
            return back()->with('error', 'You cannot add your own listing to cart.');
        }

        $request->user()->cartItems()->firstOrCreate(
            ['listing_id' => $listing->id],
            ['listing_id' => $listing->id]
        );

        if ($request->input('intent') === 'buy') {
            return redirect()->route('cart.index')->with('status', 'Added to cart.');
        }

        return back()->with('status', 'Added to cart.');
    }

    public function destroy(Request $request, Listing $listing): RedirectResponse
    {
        $request->user()->cartItems()->where('listing_id', $listing->id)->delete();

        return back()->with('status', 'Removed from cart.');
    }
}
