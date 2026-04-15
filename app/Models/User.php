<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\LaravelPasskeys\Models\Concerns\HasPasskeys;
use Spatie\LaravelPasskeys\Models\Concerns\InteractsWithPasskeys;

class User extends Authenticatable implements HasPasskeys
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, HasUlids, InteractsWithPasskeys, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'region',
        'password',
        'seller_type',
        'extra_listing_slots',
        'stripe_customer_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'buyer_id');
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function listings()
    {
        return $this->hasMany(Listing::class);
    }

    public function localPaymentMethods()
    {
        return $this->hasMany(LocalPaymentMethod::class);
    }

    /**
     * Max listing slots = base limit (by seller type) + purchased extra slots.
     */
    public function maxListingSlots(): int
    {
        $limits = config('shop.listing_limits', ['individual' => 3, 'business' => 5]);
        $base = $limits[$this->seller_type ?? 'individual'] ?? 3;

        return $base + (int) ($this->extra_listing_slots ?? 0);
    }

    public function canCreateListing(): bool
    {
        return $this->listings()->count() < $this->maxListingSlots();
    }

    public function listingCount(): int
    {
        return $this->listings()->count();
    }
}
