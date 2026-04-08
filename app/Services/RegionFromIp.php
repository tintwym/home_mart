<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class RegionFromIp
{
    /** @var list<string> */
    public const SUPPORTED_REGIONS = ['MM', 'SG', 'US'];

    /**
     * Map timezone IDs to shop region keys (used only for private/local IPs).
     */
    protected static array $timezoneToRegion = [
        'Asia/Singapore' => 'SG',
        'Asia/Yangon' => 'MM',
        'Asia/Rangoon' => 'MM',
    ];

    /**
     * Map ISO 3166-1 alpha-2 country codes to shop regions.
     * Unlisted countries default to US (international / Stripe). SEA (excl. MM) → SG hub.
     */
    protected static array $countryToRegion = [
        'MM' => 'MM',
        'SG' => 'SG',
        'US' => 'US',
        'MY' => 'SG', 'TH' => 'SG', 'VN' => 'SG', 'PH' => 'SG', 'ID' => 'SG',
        'BN' => 'SG', 'KH' => 'SG', 'LA' => 'SG', 'TL' => 'SG',
        'HK' => 'SG', 'MO' => 'SG', 'TW' => 'SG',
    ];

    /**
     * Detect shop region: manual cookie → GPS (browser) → public IP → private IP hints / default.
     */
    public static function detect(Request $request): string
    {
        $fromPicker = self::fromShopRegionCookie($request);
        if ($fromPicker !== null) {
            return $fromPicker;
        }

        if (config('shop.gps_region_enabled', true)) {
            $fromGps = self::fromGpsCookie($request);
            if ($fromGps !== null) {
                return $fromGps;
            }
        }

        $ip = $request->ip();
        if (self::isPrivateOrLocalIp($ip)) {
            return self::fromTimezone($request)
                ?? config('shop.default_region_private', 'US');
        }

        return self::regionFromPublicIp($ip);
    }

    protected static function fromShopRegionCookie(Request $request): ?string
    {
        $raw = $request->cookie('shop_region');
        if (! is_string($raw) || $raw === '') {
            return null;
        }

        $code = strtoupper(trim($raw));

        return in_array($code, self::SUPPORTED_REGIONS, true) ? $code : null;
    }

    protected static function fromGpsCookie(Request $request): ?string
    {
        $raw = $request->cookie('user_gps');
        if (! is_string($raw) || $raw === '') {
            return null;
        }

        $raw = trim(urldecode($raw));
        if (preg_match('/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/u', $raw, $m) !== 1) {
            return null;
        }

        $lat = (float) $m[1];
        $lng = (float) $m[2];

        if (! self::areValidCoordinates($lat, $lng)) {
            return null;
        }

        return self::regionFromCoordinates($lat, $lng);
    }

    protected static function areValidCoordinates(float $lat, float $lng): bool
    {
        if ($lat < -90.0 || $lat > 90.0 || $lng < -180.0 || $lng > 180.0) {
            return false;
        }

        if (abs($lat) < 1e-6 && abs($lng) < 1e-6) {
            return false;
        }

        return true;
    }

    protected static function regionFromCoordinates(float $lat, float $lng): string
    {
        $latR = round($lat, 3);
        $lngR = round($lng, 3);
        $cacheKey = "region_from_gps:{$latR}:{$lngR}";

        return Cache::remember($cacheKey, now()->addHours(6), function () use ($lat, $lng) {
            $cc = self::reverseGeocodeCountryCode($lat, $lng);
            if ($cc !== null && $cc !== '') {
                return self::mapCountryCodeToRegion(strtoupper($cc));
            }

            return self::regionFromNearestAnchor($lat, $lng);
        });
    }

    protected static function reverseGeocodeCountryCode(float $lat, float $lng): ?string
    {
        try {
            $ua = trim((string) config('app.name', 'HomeMart')).' '.trim((string) config('app.url', 'https://example.com'));

            $response = Http::timeout(4)
                ->withHeaders([
                    'User-Agent' => $ua !== '' ? $ua : 'HomeMart/1.0',
                    'Accept-Language' => 'en',
                ])
                ->get('https://nominatim.openstreetmap.org/reverse', [
                    'lat' => $lat,
                    'lon' => $lng,
                    'format' => 'json',
                ]);

            if (! $response->successful()) {
                return null;
            }

            $data = $response->json();
            $cc = is_array($data) ? ($data['address']['country_code'] ?? null) : null;

            return is_string($cc) ? strtolower($cc) : null;
        } catch (\Throwable) {
            return null;
        }
    }

    protected static function regionFromNearestAnchor(float $lat, float $lng): string
    {
        $anchors = config('shop.gps_fallback_anchors', []);
        if (! is_array($anchors) || $anchors === []) {
            return config('shop.default_region', 'MM');
        }

        $best = null;
        $bestKm = PHP_FLOAT_MAX;

        foreach ($anchors as $region => $pt) {
            if (! is_array($pt) || ! isset($pt['lat'], $pt['lng'])) {
                continue;
            }
            if (! is_string($region) || ! in_array($region, self::SUPPORTED_REGIONS, true)) {
                continue;
            }

            $km = self::haversineKm($lat, $lng, (float) $pt['lat'], (float) $pt['lng']);
            if ($km < $bestKm) {
                $bestKm = $km;
                $best = $region;
            }
        }

        return is_string($best) ? $best : config('shop.default_region', 'MM');
    }

    protected static function haversineKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earth = 6371.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return 2 * $earth * asin(min(1.0, sqrt($a)));
    }

    protected static function mapCountryCodeToRegion(string $countryCode): string
    {
        return self::$countryToRegion[$countryCode] ?? 'US';
    }

    protected static function isPrivateOrLocalIp(?string $ip): bool
    {
        if ($ip === null || $ip === '') {
            return true;
        }

        if ($ip === '127.0.0.1' || $ip === '::1') {
            return true;
        }

        if (str_starts_with($ip, '10.')) {
            return true;
        }

        if (str_starts_with($ip, '192.168.')) {
            return true;
        }

        if (preg_match('/^172\.(1[6-9]|2\d|3[0-1])\./', $ip) === 1) {
            return true;
        }

        return false;
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

    protected static function regionFromPublicIp(string $ip): string
    {
        $cacheKey = 'region_from_ip:'.$ip;

        return Cache::remember($cacheKey, now()->addDay(), function () use ($ip) {
            $countryCode = self::fetchCountryCode($ip);
            if ($countryCode === null || $countryCode === '') {
                return config('shop.default_region', 'MM');
            }

            return self::mapCountryCodeToRegion(strtoupper($countryCode));
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
