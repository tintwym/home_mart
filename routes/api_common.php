<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\ListingApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

if (! function_exists('registerHomemartJsonApiRoutes')) {
    /**
     * Shared JSON routes for /api (default) and /mapi (mobile alias).
     * Uses api middleware: no session/CSRF; Sanctum tokens via Bearer header.
     */
    function registerHomemartJsonApiRoutes(): void
    {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);

        Route::get('/categories', [CategoryApiController::class, 'index']);
        Route::get('/listings', [ListingApiController::class, 'index']);
        Route::get('/listings/{listing}', [ListingApiController::class, 'show']);

        Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
            return $request->user();
        });
    }
}
