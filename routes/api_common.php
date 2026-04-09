<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\ChatApiController;
use App\Http\Controllers\Api\ListingApiController;
use App\Http\Controllers\Api\UserPasswordApiController;
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

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::get('/user', function (Request $request) {
                return $request->user();
            });

            // Chat (for iOS/Android app) - also available under /mapi/*
            Route::get('/conversations', [ChatApiController::class, 'conversations']);
            Route::get('/conversations/{conversation}/messages', [ChatApiController::class, 'messagesIndex']);
            Route::post('/conversations/{conversation}/messages', [ChatApiController::class, 'messagesStore']);

            Route::put('/password', [UserPasswordApiController::class, 'update']);
            Route::put('/user/password', [UserPasswordApiController::class, 'update']);
        });
    }
}
