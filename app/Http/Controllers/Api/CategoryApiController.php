<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryApiController extends Controller
{
    /**
     * List categories for navbar / filters (native app).
     */
    public function index(): JsonResponse
    {
        $parents = Category::query()
            ->with(['subcategories' => fn ($q) => $q->orderBy('id')])
            ->orderBy('id')
            ->get(['id', 'name', 'slug']);

        $flat = [];
        foreach ($parents as $cat) {
            $flat[] = [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'category_id' => null,
                'subcategory_id' => null,
            ];
            foreach ($cat->subcategories as $sub) {
                $flat[] = [
                    'id' => $sub->id,
                    'name' => $sub->name,
                    'slug' => $sub->slug,
                    'category_id' => $cat->id,
                    'subcategory_id' => $sub->id,
                ];
            }
        }

        $tree = $parents->map(fn ($parent) => [
            'id' => $parent->id,
            'name' => $parent->name,
            'slug' => $parent->slug,
            'category_id' => null,
            'children' => $parent->subcategories->map(
                fn ($c) => [
                    'id' => $c->id,
                    'subcategory_id' => $c->id,
                    'category_id' => $parent->id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                ]
            )->values()->all(),
        ])->values()->all();

        return response()->json([
            'data' => $flat,
            'tree' => $tree,
        ]);
    }
}
