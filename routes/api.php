<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\ListingApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public catalog (native mobile clients, SPA, etc.)
Route::get('/categories', [CategoryApiController::class, 'index']);
Route::get('/listings', [ListingApiController::class, 'index']);
Route::get('/listings/{listing}', [ListingApiController::class, 'show']);

// Protected User Route
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
