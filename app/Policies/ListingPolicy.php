<?php

namespace App\Policies;

use App\Models\Listing;
use App\Models\User;

class ListingPolicy
{
    public function create(User $user): bool
    {
        return $user->canCreateListing();
    }

    public function update(User $user, Listing $listing): bool
    {
        return $user->id === $listing->user_id;
    }

    public function delete(User $user, Listing $listing): bool
    {
        return $user->id === $listing->user_id;
    }
}
