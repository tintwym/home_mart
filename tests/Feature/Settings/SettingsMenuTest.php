<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SettingsMenuTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_view_settings_menu(): void
    {
        $this->get(route('settings.index'))
            ->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_settings_menu(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('settings.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/menu'));
    }
}
