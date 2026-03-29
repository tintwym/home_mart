<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\ConversationRead;
use App\Models\Listing;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        $conversations = $this->getConversationsForUser($request->user()->id);

        return Inertia::render('chat/index', [
            'conversations' => $conversations,
        ]);
    }

    protected function getConversationsForUser(string $userId, int $limit = 30)
    {
        $conversations = Conversation::with(['listing:id,title,image_path,price,user_id', 'buyer:id,name', 'listing.user:id,name,region'])
            ->where(function ($q) use ($userId) {
                $q->where('buyer_id', $userId)
                    ->orWhereHas('listing', fn ($lq) => $lq->where('user_id', $userId));
            })
            ->withCount('messages')
            ->with(['messages' => fn ($q) => $q->latest()->limit(1)])
            ->latest('updated_at')
            ->limit($limit)
            ->get();

        $conversationIds = $conversations->pluck('id')->all();
        $unreadCounts = [];
        if ($conversationIds !== []) {
            $unreadCounts = Message::query()
                ->whereIn('conversation_id', $conversationIds)
                ->whereNull('read_at')
                ->where('user_id', '!=', $userId)
                ->selectRaw('conversation_id, count(*) as unread_count')
                ->groupBy('conversation_id')
                ->pluck('unread_count', 'conversation_id')
                ->all();
        }
        foreach ($conversations as $conv) {
            $conv->unread_count = (int) ($unreadCounts[$conv->id] ?? 0);
        }

        return $conversations;
    }

    public function show(Conversation $conversation, Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $conversation->loadMissing('listing:id,user_id');
        $participants = [$conversation->buyer_id, $conversation->listing->user_id];
        if (! in_array($user->id, $participants)) {
            abort(403);
        }

        $otherUserId = $conversation->buyer_id === $user->id
            ? $conversation->listing->user_id
            : $conversation->buyer_id;

        ConversationRead::updateOrCreate(
            ['conversation_id' => $conversation->id, 'user_id' => $user->id],
            ['last_read_at' => now()]
        );
        Cache::forget("chat.unread.{$user->id}");

        $conversation->messages()
            ->where('user_id', $otherUserId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $conversation->load(['listing:id,title,image_path,price,user_id', 'buyer:id,name', 'listing.user:id,name,region']);

        $messagesPageSize = 50;
        $messagesCollection = $conversation->messages()
            ->with('user:id,name')
            ->latest()
            ->limit($messagesPageSize + 1)
            ->get();
        $messagesHasMore = $messagesCollection->count() > $messagesPageSize;
        if ($messagesHasMore) {
            $messagesCollection = $messagesCollection->take($messagesPageSize);
        }
        // Chronological order: oldest first (first sent at top), newest at bottom
        $messagesCollection = $messagesCollection->sortBy('created_at')->values();

        $otherReadAtRaw = ConversationRead::where('conversation_id', $conversation->id)->where('user_id', $otherUserId)->value('last_read_at');
        $otherReadAt = $otherReadAtRaw ? \Carbon\Carbon::parse($otherReadAtRaw) : null;
        $messages = $messagesCollection->map(function ($msg) use ($user, $otherReadAt) {
            $arr = $msg->only(['id', 'body', 'created_at', 'user_id', 'read_at']);
            $arr['user'] = $msg->user ? $msg->user->only(['id', 'name']) : null;
            $arr['status'] = $msg->user_id === $user->id
                ? ($msg->read_at ? 'seen' : ($otherReadAt && $otherReadAt->gte($msg->created_at) ? 'delivered' : 'sent'))
                : null;

            return $arr;
        })->values()->all();

        $conversations = Cache::remember(
            "chat.sidebar.{$user->id}",
            now()->addSeconds(10),
            fn () => $this->getConversationsForUser($user->id, 15)
        );

        return Inertia::render('chat/show', [
            'conversations' => $conversations,
            'conversation' => $conversation,
            'messages' => $messages,
            'messages_has_more' => $messagesHasMore,
        ]);
    }

    public function store(Request $request, Listing $listing): RedirectResponse
    {
        $buyerId = $request->user()->id;
        if ($listing->user_id === $buyerId) {
            return back()->with('error', 'You cannot chat with yourself.');
        }

        $conversation = Conversation::firstOrCreate(
            [
                'listing_id' => $listing->id,
                'buyer_id' => $buyerId,
            ],
            ['listing_id' => $listing->id, 'buyer_id' => $buyerId]
        );

        return redirect()->route('chat.show', $conversation);
    }

    public function sendMessage(Request $request, Conversation $conversation): RedirectResponse
    {
        $user = $request->user();
        $participants = [$conversation->buyer_id, $conversation->listing->user_id];
        if (! in_array($user->id, $participants)) {
            abort(403);
        }

        $request->validate(['body' => ['required', 'string', 'max:2000']]);

        $conversation->messages()->create([
            'user_id' => $user->id,
            'body' => $request->body,
        ]);

        $conversation->touch();

        Cache::forget("chat.sidebar.{$user->id}");
        $otherUserId = $conversation->buyer_id === $user->id
            ? $conversation->loadMissing('listing')->listing->user_id
            : $conversation->buyer_id;
        Cache::forget("chat.unread.{$otherUserId}");

        return back();
    }

    /**
     * Get new messages since a timestamp (for polling, Messenger-style).
     */
    public function messagesSince(Conversation $conversation, Request $request): JsonResponse
    {
        $user = $request->user();
        $conversation->loadMissing('listing:id,user_id');
        $participants = [$conversation->buyer_id, $conversation->listing->user_id];
        if (! in_array($user->id, $participants)) {
            abort(403);
        }
        $after = $request->query('after');
        if (! $after) {
            return response()->json(['messages' => []]);
        }
        $otherUserId = $conversation->buyer_id === $user->id
            ? $conversation->listing->user_id
            : $conversation->buyer_id;
        $otherReadAt = ConversationRead::where('conversation_id', $conversation->id)->where('user_id', $otherUserId)->value('last_read_at');
        $otherReadAtParsed = $otherReadAt ? \Carbon\Carbon::parse($otherReadAt) : null;
        $messages = $conversation->messages()
            ->with('user:id,name')
            ->where('created_at', '>', $after)
            ->orderBy('created_at')
            ->get();
        $list = $messages->map(function ($msg) use ($user, $otherReadAtParsed) {
            $arr = $msg->only(['id', 'body', 'created_at', 'user_id', 'read_at']);
            $arr['user'] = $msg->user ? $msg->user->only(['id', 'name']) : null;
            $arr['status'] = $msg->user_id === $user->id
                ? ($msg->read_at ? 'seen' : ($otherReadAtParsed && $otherReadAtParsed->gte($msg->created_at) ? 'delivered' : 'sent'))
                : null;

            return $arr;
        })->values()->all();

        return response()->json(['messages' => $list]);
    }

    /**
     * Report that the current user is typing (for typing indicator).
     */
    public function typing(Conversation $conversation, Request $request): \Illuminate\Http\Response
    {
        $user = $request->user();
        $conversation->loadMissing('listing:id,user_id');
        $participants = [$conversation->buyer_id, $conversation->listing->user_id];
        if (! in_array($user->id, $participants)) {
            abort(403);
        }
        $key = "chat.typing.{$conversation->id}.{$user->id}";
        Cache::put($key, ['name' => $user->name], now()->addSeconds(5));

        return response()->noContent();
    }

    /**
     * Check if the other participant is typing (for polling).
     */
    public function typingStatus(Conversation $conversation, Request $request): JsonResponse
    {
        $user = $request->user();
        $conversation->loadMissing('listing:id,user_id');
        $otherUserId = $conversation->buyer_id === $user->id
            ? $conversation->listing->user_id
            : $conversation->buyer_id;
        $key = "chat.typing.{$conversation->id}.{$otherUserId}";
        $cached = Cache::get($key);

        return response()->json([
            'typing' => (bool) $cached,
            'user_name' => $cached['name'] ?? null,
        ]);
    }
}
