<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Subcategory extends Model
{
    use HasUlids;

    protected $fillable = ['category_id', 'name', 'slug'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    protected static function booted(): void
    {
        $forget = fn () => Cache::forget('categories.sidebar');
        static::saved($forget);
        static::deleted($forget);
    }
}
