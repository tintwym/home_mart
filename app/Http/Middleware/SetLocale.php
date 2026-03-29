<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    protected array $locales = ['en', 'zh', 'my'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = session('locale', config('app.locale'));

        if (in_array($locale, $this->locales, true)) {
            app()->setLocale($locale);
        }

        return $next($request);
    }
}
