<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LocalPaymentMethod extends Model
{
    use HasUlids;

    public const TYPE_MPU = 'mpu';

    public const TYPE_KBZ_PAY = 'kbz_pay';

    public const TYPE_AYA_PAY = 'aya_pay';

    public const TYPE_WAVE_PAY = 'wave_pay';

    public const TYPE_CB_PAY = 'cb_pay';

    protected $fillable = [
        'user_id',
        'type',
        'identifier',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<string, string>
     */
    public static function typeLabels(): array
    {
        return [
            self::TYPE_MPU => 'MPU Debit Card',
            self::TYPE_KBZ_PAY => 'KBZ Pay',
            self::TYPE_AYA_PAY => 'AYA Pay',
            self::TYPE_WAVE_PAY => 'Wave Pay',
            self::TYPE_CB_PAY => 'CB Pay',
        ];
    }

    public function getTypeLabelAttribute(): string
    {
        return self::typeLabels()[$this->type] ?? $this->type;
    }
}
