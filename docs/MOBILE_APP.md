# Home Mart mobile apps

This repository is the **Laravel backend only**. **iOS** (Xcode, Swift/SwiftUI) and **Android** (Kotlin, e.g. Jetpack Compose + Retrofit/OkHttp) live in separate app projects. They call this API over HTTPS.

## API base paths (same handlers)

| Prefix   | Example              | Use case |
|----------|----------------------|----------|
| `/api/*` | `GET /api/categories` | Default Laravel convention |
| `/mapi/*`| `GET /mapi/categories` | Same JSON; optional alias for apps that expect a “mobile” prefix |

Both use the **`api` middleware group** (no browser session, no CSRF). **Do not** POST login to a `web` route from native code or you may get **419**.

## Auth (Sanctum personal access tokens)

1. `POST /api/login` or `POST /mapi/login` with JSON body: `{ "email", "password" }`.
2. Response includes `token` (plain text) and `user`.
3. Store the token securely (Keychain on iOS, EncryptedSharedPreferences / DataStore on Android).
4. Send `Authorization: Bearer <token>` on protected routes (e.g. `GET /api/user`).

**Database:** run migrations so `personal_access_tokens` exists (`php artisan migrate`). Without it, login/token creation returns 500.

## iOS (Xcode)

- Use **`URLSession`** (or Alamofire) with `application/json` bodies for POST.
- Do **not** rely on `X-XSRF-TOKEN` or cookies for the JSON API.
- Base URL examples: `https://your-domain.com` — request paths `/api/categories`, `/mapi/login`, etc.

## Android (Kotlin)

- Use **Retrofit + OkHttp**; `MediaType` `application/json`; Gson/Kotlinx serialization for models.
- OkHttp interceptor: add `Authorization: Bearer …` after login.
- Base URL examples: `https://your-domain.com/api/` (trailing slash matches Retrofit `@GET("categories")`) **or** `https://your-domain.com/` with `@GET("api/categories")` — stay consistent.

## Automated checks (backend)

PHPUnit **`Tests\Feature\Api\MobileNativeApiTest`** asserts `/mapi` matches `/api`, login is not CSRF-rejected (not 419), and Bearer auth works. Run:

```bash
php artisan test --filter=MobileNativeApiTest
```

## Website `/download` page

- **`APP_ANDROID_PLAY_STORE_URL`** — primary “Get it on Google Play” button.
- **`public/downloads/homemart.apk`** — optional sideload APK (testing / outside Play).
- **`APP_IOS_STORE_URL`** — App Store or TestFlight link when you have a native or hybrid iOS app.

## Removed: Capacitor

This repo **no longer** ships a Capacitor (WebView) shell. The old `capacitor.config.ts`, npm `cap:*` scripts, and committed `ios/` Capacitor project were removed to avoid duplicating the native Android approach. If you need that workflow again, restore it from git history and re-add `@capacitor/*` packages.
