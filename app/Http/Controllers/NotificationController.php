<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->unreadNotifications()
            ->take(20)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'type' => $n->data['type'] ?? 'unknown',
                'data' => $n->data,
                'created_at' => $n->created_at->toIso8601String(),
            ]);

        return response()->json($notifications);
    }

    public function markAsRead(Request $request, string $id): Response
    {
        $request->user()->unreadNotifications()->where('id', $id)->firstOrFail()->markAsRead();

        return response()->noContent();
    }

    public function markAllAsRead(Request $request): Response
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->noContent();
    }
}
