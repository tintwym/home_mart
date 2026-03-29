<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Only force HTTPS in production. In local/dev, use whatever scheme the server uses
        // so assets load correctly (php artisan serve is HTTP-only; forcing https causes ERR_CONNECTION_CLOSED).
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
        $this->configureDefaults();
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        // In production, destructive commands (migrate:fresh, db:wipe, etc.) are blocked unless
        // ALLOW_DESTRUCTIVE_DB_COMMANDS=1 (set only when intentionally running e.g. migrate:fresh on Aiven).
        DB::prohibitDestructiveCommands(
            app()->isProduction() && ! config('app.allow_destructive_db_commands', false),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
