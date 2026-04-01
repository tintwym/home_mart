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

                // Timezone hint for region when IP is local/private only (see RegionFromIp)
                try {
                    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    if (tz) {
                        document.cookie = 'user_timezone=' + encodeURIComponent(tz) + ';path=/;max-age=31536000;samesite=lax';
                    }
                } catch (e) {}

                // GPS → user_gps cookie (server reverse-geocodes to MM|SG|US). Prompts once per site if allowed.
                try {
                    if (!('geolocation' in navigator) || !navigator.geolocation) return;
                    navigator.geolocation.getCurrentPosition(
                        function (pos) {
                            var lat = pos.coords.latitude;
                            var lng = pos.coords.longitude;
                            if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return;
                            var v = String(lat) + ',' + String(lng);
                            var m = document.cookie.match(/(?:^|; )user_gps=([^;]*)/);
                            var prev = m ? decodeURIComponent(m[1]) : '';
                            document.cookie = 'user_gps=' + encodeURIComponent(v) + ';path=/;max-age=604800;samesite=lax';
                            if (prev !== v && !sessionStorage.getItem('hm_gps_reload')) {
                                sessionStorage.setItem('hm_gps_reload', '1');
                                window.location.reload();
                            }
                        },
                        function () {},
                        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
                    );
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

        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
        <link rel="icon" href="/homemart-logo.png" type="image/png" sizes="512x512">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
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
