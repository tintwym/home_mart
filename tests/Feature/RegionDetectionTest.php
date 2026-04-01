<?php

namespace Tests\Feature;

use App\Services\RegionFromIp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RegionDetectionTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_shop_region_cookie_overrides_localhost(): void
    {
        Http::fake();

        $request = Request::create('/', 'GET', [], ['shop_region' => 'SG'], [], [
            'REMOTE_ADDR' => '127.0.0.1',
        ]);

        $this->assertSame('SG', RegionFromIp::detect($request));
    }

    public function test_public_ip_uses_geolocation_country(): void
    {
        Http::fake([
            'ip-api.com/*' => Http::response(['countryCode' => 'MM'], 200),
        ]);

        $request = Request::create('/', 'GET', [], [], [], [
            'REMOTE_ADDR' => '8.8.8.8',
        ]);

        $this->assertSame('MM', RegionFromIp::detect($request));
    }

    public function test_unlisted_country_maps_to_us(): void
    {
        Http::fake([
            'ip-api.com/*' => Http::response(['countryCode' => 'DE'], 200),
        ]);

        $request = Request::create('/', 'GET', [], [], [], [
            'REMOTE_ADDR' => '203.0.113.10',
        ]);

        $this->assertSame('US', RegionFromIp::detect($request));
    }

    public function test_thailand_maps_to_sg_hub(): void
    {
        Http::fake([
            'ip-api.com/*' => Http::response(['countryCode' => 'TH'], 200),
        ]);

        $request = Request::create('/', 'GET', [], [], [], [
            'REMOTE_ADDR' => '203.0.113.11',
        ]);

        $this->assertSame('SG', RegionFromIp::detect($request));
    }

    public function test_localhost_falls_back_to_config_when_no_cookie(): void
    {
        Http::fake();
        config(['shop.default_region' => 'US']);

        $request = Request::create('/', 'GET', [], [], [], [
            'REMOTE_ADDR' => '127.0.0.1',
        ]);

        $this->assertSame('US', RegionFromIp::detect($request));
    }

    public function test_gps_cookie_overrides_public_ip(): void
    {
        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([
                'address' => ['country_code' => 'sg'],
            ], 200),
            'ip-api.com/*' => Http::response(['countryCode' => 'US'], 200),
        ]);

        $request = Request::create('/', 'GET', [], ['user_gps' => '1.28,103.85'], [], [
            'REMOTE_ADDR' => '8.8.8.8',
        ]);

        $this->assertSame('SG', RegionFromIp::detect($request));
    }

    public function test_invalid_user_gps_cookie_falls_back_to_ip(): void
    {
        Http::fake([
            'ip-api.com/*' => Http::response(['countryCode' => 'TH'], 200),
        ]);

        $request = Request::create('/', 'GET', [], ['user_gps' => 'not-a-coordinate'], [], [
            'REMOTE_ADDR' => '203.0.113.20',
        ]);

        $this->assertSame('SG', RegionFromIp::detect($request));
    }

    public function test_gps_when_nominatim_fails_uses_nearest_anchor(): void
    {
        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response(null, 503),
        ]);

        $request = Request::create('/', 'GET', [], ['user_gps' => '16.8661,96.1951'], [], [
            'REMOTE_ADDR' => '127.0.0.1',
        ]);

        $this->assertSame('MM', RegionFromIp::detect($request));
    }
}
