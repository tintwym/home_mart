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
        $this->applyVercelServerlessDefaults();

        // Only force HTTPS in production. In local/dev, use whatever scheme the server uses
        // so assets load correctly (php artisan serve is HTTP-only; forcing https causes ERR_CONNECTION_CLOSED).
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
        $this->configureDefaults();
    }

    /**
     * Vercel PHP is serverless: database session/cache/queue force a DB round-trip every request.
     * If MySQL is slow or misconfigured, the whole site returns 500. Force safe drivers unless opted in.
     * Set ALLOW_VERCEL_DATABASE_DRIVERS=true in Vercel when DB + tables are proven and you need them.
     */
    protected function applyVercelServerlessDefaults(): void
    {
        if (! $this->runningOnVercel()) {
            return;
        }

        if (filter_var(env('ALLOW_VERCEL_DATABASE_DRIVERS'), FILTER_VALIDATE_BOOLEAN)) {
            return;
        }

        if (config('session.driver') === 'database') {
            config(['session.driver' => 'cookie']);
        }

        $cache = config('cache.default');
        if (in_array($cache, ['database', 'redis', 'memcached', 'dynamodb'], true)) {
            config(['cache.default' => 'array']);
        }

        if (config('queue.default') === 'database') {
            config(['queue.default' => 'sync']);
        }
    }

    protected function runningOnVercel(): bool
    {
        $vercel = env('VERCEL', getenv('VERCEL') ?: '');

        if (filter_var($vercel, FILTER_VALIDATE_BOOLEAN)) {
            return true;
        }

        $vercelUrl = env('VERCEL_URL', getenv('VERCEL_URL') ?: '');

        return is_string($vercelUrl) && $vercelUrl !== '';
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
