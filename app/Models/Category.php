<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Category extends Model
{
    use HasUlids; // Required for string-based IDs

    protected $fillable = ['name', 'slug'];

    protected static function booted(): void
    {
        $forget = fn () => Cache::forget('categories.sidebar');
        static::saved($forget);
        static::deleted($forget);
    }
}
