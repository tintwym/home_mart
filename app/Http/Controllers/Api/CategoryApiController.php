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
        $categories = Category::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'parent_id']);

        $byParent = [];
        foreach ($categories as $row) {
            $parentKey = ($row->parent_id !== null && $row->parent_id !== '')
                ? (string) $row->parent_id
                : '';
            $byParent[$parentKey][] = $row;
        }

        $tree = [];
        foreach (($byParent[''] ?? []) as $parent) {
            $tree[] = [
                'id' => $parent->id,
                'name' => $parent->name,
                'slug' => $parent->slug,
                'children' => array_map(
                    fn ($c) => [
                        'id' => $c->id,
                        'name' => $c->name,
                        'slug' => $c->slug,
                    ],
                    $byParent[$parent->id] ?? []
                ),
            ];
        }

        return response()->json([
            'data' => $categories,
            'tree' => $tree,
        ]);
    }
}
