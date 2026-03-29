<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class RegionFromIp
{
    /**
     * Map timezone IDs to shop region keys.
     * Asia/Singapore -> SG, Asia/Yangon -> MM.
     */
    protected static array $timezoneToRegion = [
        'Asia/Singapore' => 'SG',
        'Asia/Yangon' => 'MM',
        'Asia/Rangoon' => 'MM',
    ];

    /**
     * Map ISO country codes to shop region keys (IP fallback).
     */
    protected static array $countryToRegion = [
        'SG' => 'SG',
        'MM' => 'MM',
        'US' => 'US',
    ];

    /**
     * Detect the shop region.
     * 1. Timezone cookie (browser) - most reliable for Singapore vs Myanmar
     * 2. IP geolocation - fallback
     * 3. SHOP_REGION config - localhost / final fallback
     */
    public static function detect(Request $request): string
    {
        $region = self::fromTimezone($request);
        if ($region !== null) {
            return $region;
        }

        return self::fromIp($request);
    }

    protected static function fromTimezone(Request $request): ?string
    {
        $tz = $request->cookie('user_timezone');
        if (! $tz) {
            return null;
        }

        $tz = urldecode($tz);

        return self::$timezoneToRegion[$tz] ?? null;
    }

    protected static function fromIp(Request $request): string
    {
        $ip = $request->ip();
        if (! $ip || $ip === '127.0.0.1' || str_starts_with($ip, '192.168.') || str_starts_with($ip, '10.')) {
            return config('shop.default_region', 'MM');
        }

        $cacheKey = 'region_from_ip:'.$ip;

        return Cache::remember($cacheKey, now()->addDay(), function () use ($ip) {
            $countryCode = self::fetchCountryCode($ip);

            return self::$countryToRegion[$countryCode] ?? config('shop.default_region', 'MM');
        });
    }

    protected static function fetchCountryCode(string $ip): ?string
    {
        try {
            $response = Http::timeout(3)->get('http://ip-api.com/json/'.$ip, [
                'fields' => 'countryCode',
            ]);

            if ($response->successful()) {
                $data = $response->json();

                return $data['countryCode'] ?? null;
            }
        } catch (\Throwable) {
            // Ignore errors, fall back to config default
        }

        return null;
    }
}
