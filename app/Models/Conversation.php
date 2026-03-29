<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'listing_id',
        'buyer_id',
    ];

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->latest();
    }

    public function otherUser(User $user): User
    {
        return $this->buyer_id === $user->id
            ? $this->listing->user
            : $this->buyer;
    }

    public function participants(): array
    {
        return [$this->buyer_id, $this->listing->user_id];
    }
}
