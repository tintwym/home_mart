<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\ConversationRead;
use App\Models\Message;
use Illuminate\Http\Request;

class ChatApiController extends Controller
{
    /**
     * GET /api/conversations and /mapi/conversations
     */
    public function conversations(Request $request)
    {
        $user = $request->user();

        $limit = (int) ($request->query('limit', 30));
        $limit = max(1, min(100, $limit));

        $conversations = Conversation::with([
            'listing:id,title,image_path,price,user_id',
            'buyer:id,name',
            'listing.user:id,name,region',
        ])
            ->where(function ($q) use ($user) {
                $q->where('buyer_id', $user->id)
                    ->orWhereHas('listing', fn ($lq) => $lq->where('user_id', $user->id));
            })
            ->withCount('messages')
            ->with(['messages' => fn ($q) => $q->latest()->limit(1)->with('user:id,name')])
            ->latest('updated_at')
            ->limit($limit)
            ->get();

        $conversationIds = $conversations->pluck('id')->all();
        $unreadCounts = [];
        if ($conversationIds !== []) {
            $unreadCounts = Message::query()
                ->whereIn('conversation_id', $conversationIds)
                ->whereNull('read_at')
                ->where('user_id', '!=', $user->id)
                ->selectRaw('conversation_id, count(*) as unread_count')
                ->groupBy('conversation_id')
                ->pluck('unread_count', 'conversation_id')
                ->all();
        }

        $data = $conversations->map(function (Conversation $conv) use ($user, $unreadCounts) {
            $last = $conv->messages->first();
            $other = $conv->buyer_id === $user->id ? $conv->listing?->user : $conv->buyer;

            return [
                'id' => $conv->id,
                'title' => $other?->name ?? ($conv->listing->title ?? 'Conversation'),
                'listing' => $conv->listing
                    ? [
                        'id' => $conv->listing->id,
                        'title' => $conv->listing->title,
                        'image_path' => $conv->listing->image_path,
                        'price' => $conv->listing->price,
                        'seller' => $conv->listing->user
                            ? [
                                'id' => $conv->listing->user->id,
                                'name' => $conv->listing->user->name,
                                'region' => $conv->listing->user->region,
                            ]
                            : null,
                    ]
                    : null,
                'last_message' => $last?->body,
                'last_message_at' => $last?->created_at,
                'unread_count' => (int) ($unreadCounts[$conv->id] ?? 0),
                'updated_at' => $conv->updated_at,
            ];
        })->values();

        return response()->json(['conversations' => $data]);
    }

    /**
     * GET /api/conversations/{conversation}/messages and /mapi/conversations/{conversation}/messages
     */
    public function messagesIndex(Conversation $conversation, Request $request)
    {
        $user = $request->user();
        $conversation->loadMissing('listing:id,user_id', 'buyer:id,name', 'listing.user:id,name');

        if (! in_array($user->id, [$conversation->buyer_id, $conversation->listing->user_id], true)) {
            abort(403);
        }

        $limit = (int) ($request->query('limit', 50));
        $limit = max(1, min(200, $limit));

        $messages = $conversation->messages()
            ->with('user:id,name')
            ->latest()
            ->limit($limit)
            ->get()
            ->sortBy('created_at')
            ->values()
            ->map(function (Message $msg) use ($user) {
                return [
                    'id' => $msg->id,
                    'text' => $msg->body,
                    'sent_at' => $msg->created_at,
                    'is_me' => $msg->user_id === $user->id,
                    'sender' => $msg->user ? $msg->user->only(['id', 'name']) : null,
                    'read_at' => $msg->read_at,
                ];
            });

        return response()->json([
            'conversation' => [
                'id' => $conversation->id,
            ],
            'messages' => $messages,
        ]);
    }

    /**
     * POST /api/conversations/{conversation}/messages and /mapi/conversations/{conversation}/messages
     */
    public function messagesStore(Conversation $conversation, Request $request)
    {
        $user = $request->user();
        $conversation->loadMissing('listing:id,user_id');

        if (! in_array($user->id, [$conversation->buyer_id, $conversation->listing->user_id], true)) {
            abort(403);
        }

        $validated = $request->validate([
            'text' => ['required', 'string', 'max:2000'],
        ]);

        $msg = $conversation->messages()->create([
            'user_id' => $user->id,
            'body' => $validated['text'],
        ]);

        $conversation->touch();

        // Mark sender as "read up to now" for accurate unread counters.
        ConversationRead::updateOrCreate(
            ['conversation_id' => $conversation->id, 'user_id' => $user->id],
            ['last_read_at' => now()]
        );

        return response()->json([
            'message' => [
                'id' => $msg->id,
                'text' => $msg->body,
                'sent_at' => $msg->created_at,
                'is_me' => true,
            ],
        ], 201);
    }
}
