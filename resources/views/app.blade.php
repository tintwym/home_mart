<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)">
        <meta name="mobile-web-app-capable" content="yes">

        {{-- Inline script: always follow system dark/light preference (no button/setting) --}}
        <script>
            (function() {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.toggle('dark', prefersDark);
                document.documentElement.style.colorScheme = prefersDark ? 'dark' : 'light';

                // Set timezone cookie for region detection (Singapore vs Myanmar)
                try {
                    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    if (tz) {
                        document.cookie = 'user_timezone=' + encodeURIComponent(tz) + ';path=/;max-age=31536000;samesite=lax';
                    }
                } catch (e) {}
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/homemart-logo.png" sizes="any">
        <link rel="icon" href="/homemart-logo.png" type="image/png">
        <link rel="apple-touch-icon" href="/homemart-logo.png">
        <link rel="manifest" href="/manifest.json">

        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="{{ config('app.name') }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
