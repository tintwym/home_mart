<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_home_route_redirects_to_dashboard()
    {
        $response = $this->get(route('home'));

        $response->assertRedirect('/');
    }
}
