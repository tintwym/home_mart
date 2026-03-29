<?php

namespace App\Notifications;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NewFavoriteNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Listing $listing,
        public User $favoritedBy
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_favorite',
            'listing_id' => $this->listing->id,
            'listing_title' => $this->listing->title,
            'favorited_by_id' => $this->favoritedBy->id,
            'favorited_by_name' => $this->favoritedBy->name,
        ];
    }
}
