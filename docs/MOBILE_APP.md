# Home Mart mobile apps

## Android (native)

The production Android app is **native Kotlin + Jetpack Compose**, not a WebView. It talks to this Laravel backend over the **`/api/*`** routes (Sanctum token auth, same data as the website).

Reference Kotlin sources for copy/paste live in the repo under:

- `android-reference/` — minimal sample (data + a few screens)
- `android-full/` — larger scaffold (domain, Hilt, extra screens)

Set the app’s base URL to your deployed API, e.g. `https://your-domain.com/api/` (trailing slash matters for Retrofit).

## Website `/download` page

- **`APP_ANDROID_PLAY_STORE_URL`** — primary “Get it on Google Play” button.
- **`public/downloads/homemart.apk`** — optional sideload APK (testing / outside Play).
- **`APP_IOS_STORE_URL`** — App Store or TestFlight link when you have a native or hybrid iOS app.

## Removed: Capacitor

This repo **no longer** ships a Capacitor (WebView) shell. The old `capacitor.config.ts`, npm `cap:*` scripts, and committed `ios/` Capacitor project were removed to avoid duplicating the native Android approach. If you need that workflow again, restore it from git history and re-add `@capacitor/*` packages.
