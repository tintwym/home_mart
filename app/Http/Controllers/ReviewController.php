<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
use App\Models\Listing;
use Illuminate\Http\RedirectResponse;

class ReviewController extends Controller
{
    public function store(StoreReviewRequest $request, Listing $listing): RedirectResponse
    {
        $listing->reviews()->updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'rating' => $request->validated('rating'),
                'comment' => $request->validated('comment'),
            ]
        );

        return back()->with('status', 'Review saved.');
    }
}
