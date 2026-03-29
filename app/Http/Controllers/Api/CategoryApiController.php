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
            ->get(['id', 'name', 'slug']);

        return response()->json([
            'data' => $categories,
        ]);
    }
}
