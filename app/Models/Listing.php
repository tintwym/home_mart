<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class Listing extends Model
{
    use HasFactory, HasUlids;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'condition',
        'price',
        'image_path',
        'meetup_location',
        'trending_until',
    ];

    protected function casts(): array
    {
        return [
            'trending_until' => 'datetime',
        ];
    }

    /**
     * Public URL for the listing image (works with relative paths and when behind proxy).
     */
    protected function imageUrl(): Attribute
    {
        return Attribute::get(function (): ?string {
            $path = $this->image_path;
            if (! $path) {
                return null;
            }
            // Full URL (Cloudinary, S3, etc.) – use as-is
            if (str_starts_with($path, 'http')) {
                return $path;
            }
            $relativePath = str_starts_with($path, '/storage/')
                ? substr($path, 9)
                : $path;
            $disk = config('filesystems.listing_disk', 'public');

            // Public disk: use relative URL so images load from the same origin (works even if APP_URL is wrong)
            if ($disk === 'public') {
                return '/storage/'.ltrim($relativePath, '/');
            }

            return Storage::disk($disk)->url($relativePath);
        });
    }

    /**
     * Append image_url when serializing so the frontend always gets a working URL.
     *
     * @var list<string>
     */
    protected $appends = ['image_url'];

    /**
     * Relationship: A listing belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: A listing belongs to a category.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relationship: A listing has many reviews.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Relationship: A listing has many conversations.
     */
    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    /**
     * Average rating (1-5) from reviews.
     */
    public function averageRating(): float
    {
        return (float) $this->reviews()->avg('rating');
    }

    public function isTrending(): bool
    {
        return $this->trending_until && $this->trending_until->isFuture();
    }

    public function scopeOrderByTrendingFirst($query)
    {
        return $query->orderByRaw('CASE WHEN trending_until IS NOT NULL AND trending_until > CURRENT_TIMESTAMP THEN 0 ELSE 1 END')
            ->orderByDesc('trending_until')
            ->latest();
    }
}
