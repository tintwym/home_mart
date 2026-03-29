<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Message $message
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $this->message->load(['user:id,name', 'conversation.listing:id,title']);

        return [
            'type' => 'new_message',
            'message_id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'from_user_id' => $this->message->user_id,
            'from_user_name' => $this->message->user?->name,
            'preview' => \Illuminate\Support\Str::limit($this->message->body, 50),
            'listing_title' => $this->message->conversation?->listing?->title,
        ];
    }
}
