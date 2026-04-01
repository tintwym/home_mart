<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Fallback shop region
    |--------------------------------------------------------------------------
    |
    | Priority (RegionFromIp): optional shop_region cookie → browser GPS cookie
    | (reverse geocode) → public IP geolocation → private IP / timezone / SHOP_REGION.
    |
    */

    'default_region' => env('SHOP_REGION', 'MM'),

    /*
    |--------------------------------------------------------------------------
    | GPS → region (browser Geolocation API sets user_gps cookie)
    |--------------------------------------------------------------------------
    |
    | Reverse geocode via OpenStreetMap Nominatim (identifying User-Agent required).
    | If that fails, the nearest entry in gps_fallback_anchors (km) is used.
    |
    */

    'gps_region_enabled' => env('SHOP_GPS_REGION_ENABLED', true),

    'gps_fallback_anchors' => [
        'MM' => ['lat' => 16.8661, 'lng' => 96.1951],
        'SG' => ['lat' => 1.2789, 'lng' => 103.8507],
        'US' => ['lat' => 39.8283, 'lng' => -98.5795],
    ],

    /*
    |--------------------------------------------------------------------------
    | Currency by region
    |--------------------------------------------------------------------------
    |
    | Used for displaying prices. code = ISO 4217, symbol = display symbol,
    | decimals = number of decimal places (MMK typically uses 0).
    |
    */

    'currencies' => [
        'SG' => ['code' => 'SGD', 'symbol' => 'S$', 'decimals' => 2],
        'MM' => ['code' => 'MMK', 'symbol' => 'MMK ', 'decimals' => 0],
        'US' => ['code' => 'USD', 'symbol' => '$', 'decimals' => 2],
    ],

    'default_currency' => ['code' => 'USD', 'symbol' => '$', 'decimals' => 2],

    /*
    |--------------------------------------------------------------------------
    | Shop locations by region (with GPS coordinates)
    |--------------------------------------------------------------------------
    |
    | Each location has name and lat/lng. The app uses the user's GPS to
    | sort by distance (nearest first) and optionally show distance.
    | Coordinates are in decimal degrees (WGS84).
    |
    */

    'regions' => [
        'MM' => [
            ['name' => 'Yangon', 'lat' => 16.8661, 'lng' => 96.1951],
            ['name' => 'Mandalay', 'lat' => 21.9588, 'lng' => 96.0891],
            ['name' => 'Naypyidaw', 'lat' => 19.7475, 'lng' => 96.1153],
            ['name' => 'Mawlamyine', 'lat' => 16.4919, 'lng' => 97.6280],
            ['name' => 'Taunggyi', 'lat' => 20.7891, 'lng' => 97.0378],
            ['name' => 'Bago', 'lat' => 17.3358, 'lng' => 96.4817],
            ['name' => 'Monywa', 'lat' => 22.1086, 'lng' => 95.1358],
            ['name' => 'Myitkyina', 'lat' => 25.3833, 'lng' => 97.3967],
            ['name' => 'Pathein', 'lat' => 16.7795, 'lng' => 94.7324],
            ['name' => 'Sittwe', 'lat' => 20.1442, 'lng' => 92.8962],
        ],
        'US' => [
            ['name' => 'New York', 'lat' => 40.7128, 'lng' => -74.0060],
            ['name' => 'Los Angeles', 'lat' => 34.0522, 'lng' => -118.2437],
            ['name' => 'Chicago', 'lat' => 41.8781, 'lng' => -87.6298],
            ['name' => 'Houston', 'lat' => 29.7604, 'lng' => -95.3698],
            ['name' => 'Phoenix', 'lat' => 33.4484, 'lng' => -112.0740],
            ['name' => 'Philadelphia', 'lat' => 39.9526, 'lng' => -75.1652],
            ['name' => 'San Antonio', 'lat' => 29.4241, 'lng' => -98.4936],
            ['name' => 'San Diego', 'lat' => 32.7157, 'lng' => -117.1611],
        ],
        'SG' => [
            ['name' => 'Central', 'lat' => 1.2789, 'lng' => 103.8507],
            ['name' => 'East', 'lat' => 1.3248, 'lng' => 103.9273],
            ['name' => 'North', 'lat' => 1.4382, 'lng' => 103.7891],
            ['name' => 'North-East', 'lat' => 1.3574, 'lng' => 103.9020],
            ['name' => 'West', 'lat' => 1.3404, 'lng' => 103.7050],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Legacy: flat locations (optional)
    |--------------------------------------------------------------------------
    |
    | If set, used instead of regions. For GPS sort to work, use regions
    | with lat/lng. Leave empty [] to use regions + default_region.
    |
    */

    'locations' => [],

    /*
    |--------------------------------------------------------------------------
    | Listing limits by seller type
    |--------------------------------------------------------------------------
    |
    | Base number of listing slots per account. Set to a high number for
    | unlimited listings. Users can purchase extra slots (no-op when unlimited).
    |
    */

    'listing_limits' => [
        'individual' => 999_999,
        'business' => 999_999,
    ],

    /*
    |--------------------------------------------------------------------------
    | Slot purchase pricing (for display; payment integration separate)
    |--------------------------------------------------------------------------
    */

    'slot_price' => 5.00,      // per extra slot
    'slot_price_label' => '$5 per slot',

    /*
    |--------------------------------------------------------------------------
    | Trend promotion
    |--------------------------------------------------------------------------
    |
    | Sellers can pay to promote a listing (make it trend). Duration in days.
    |
    */

    'trend_duration_days' => 7,
    'trend_price' => 10.00,
    'trend_price_label' => '$10 for 7 days',

];
