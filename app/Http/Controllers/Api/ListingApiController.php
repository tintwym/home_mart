<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListingApiController extends Controller
{
    /**
     * Paginated listings (home feed, search, category filter).
     *
     * Query: q (search), category (slug), per_page (max 50)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max($request->integer('per_page', 20), 1), 50);

        $query = Listing::query()
            ->with(['category', 'user:id,name,seller_type,region'])
            ->orderByTrendingFirst();

        if ($q = $request->query('q')) {
            $query->where(function ($qry) use ($q) {
                $qry->where('title', 'like', '%'.$q.'%')
                    ->orWhere('description', 'like', '%'.$q.'%');
            });
        }

        if ($slug = $request->query('category')) {
            $category = Category::where('slug', $slug)->first();
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        $paginator = $query->paginate($perPage);

        $paginator->getCollection()->transform(fn (Listing $listing) => $this->transformListingSummary($listing));

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Single listing with reviews (detail screen).
     */
    public function show(Listing $listing): JsonResponse
    {
        $listing->load([
            'category',
            'user:id,name,seller_type,region',
            'reviews' => fn ($q) => $q->with('user:id,name')->latest(),
        ]);

        $reviews = $listing->reviews->map(fn ($review) => [
            'id' => $review->id,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'created_at' => $review->created_at?->toIso8601String(),
            'user' => [
                'id' => $review->user->id,
                'name' => $review->user->name,
            ],
        ]);

        $related = Listing::query()
            ->with(['category', 'user:id,name,seller_type,region'])
            ->where('category_id', $listing->category_id)
            ->where('id', '!=', $listing->id)
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (Listing $l) => $this->transformListingSummary($l));

        return response()->json([
            'data' => [
                'id' => $listing->id,
                'title' => $listing->title,
                'description' => $listing->description,
                'condition' => $listing->condition,
                'price' => $listing->price,
                'meetup_location' => $listing->meetup_location,
                'image_url' => $this->absoluteUrl($listing->image_url),
                'trending_until' => $listing->trending_until?->toIso8601String(),
                'is_trending' => $listing->isTrending(),
                'category' => $listing->category ? [
                    'id' => $listing->category->id,
                    'name' => $listing->category->name,
                    'slug' => $listing->category->slug,
                ] : null,
                'seller' => $listing->user ? [
                    'id' => $listing->user->id,
                    'name' => $listing->user->name,
                    'seller_type' => $listing->user->seller_type,
                    'region' => $listing->user->region,
                ] : null,
                'average_rating' => round((float) $listing->reviews->avg('rating'), 1),
                'review_count' => $listing->reviews->count(),
                'reviews' => $reviews,
                'related_listings' => $related,
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function transformListingSummary(Listing $listing): array
    {
        return [
            'id' => $listing->id,
            'title' => $listing->title,
            'description' => $listing->description,
            'condition' => $listing->condition,
            'price' => $listing->price,
            'meetup_location' => $listing->meetup_location,
            'image_url' => $this->absoluteUrl($listing->image_url),
            'trending_until' => $listing->trending_until?->toIso8601String(),
            'is_trending' => $listing->isTrending(),
            'category' => $listing->relationLoaded('category') && $listing->category
                ? [
                    'id' => $listing->category->id,
                    'name' => $listing->category->name,
                    'slug' => $listing->category->slug,
                ]
                : null,
            'seller' => $listing->relationLoaded('user') && $listing->user
                ? [
                    'id' => $listing->user->id,
                    'name' => $listing->user->name,
                    'seller_type' => $listing->user->seller_type,
                    'region' => $listing->user->region,
                ]
                : null,
        ];
    }

    private function absoluteUrl(?string $url): ?string
    {
        if ($url === null || $url === '') {
            return null;
        }
        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }

        return url($url);
    }
}
