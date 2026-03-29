<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class SettingsMenuController extends Controller
{
    /**
     * Mobile-first settings hub; desktop clients redirect to profile in the page component.
     */
    public function index(): Response
    {
        return Inertia::render('settings/menu');
    }
}
