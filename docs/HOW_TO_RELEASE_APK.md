# How to build and host an Android APK (native Kotlin app)

This project’s Android client is **native** (Kotlin), built in **Android Studio**, not from this Laravel repo’s `npm` scripts.

## 1. Build the release APK or AAB

1. Open your Android Studio project (the app that consumes `https://your-site.com/api/`).
2. **Build → Generate Signed Bundle / APK** (Play Store prefers **Android App Bundle (.aab)**).
3. Keep your signing keystore safe; you need it for every update.

## 2. Optional: sideload via this website

To offer a direct download on **`/download`**:

1. Copy the release **APK** to:

   `public/downloads/homemart.apk`

2. Deploy. The download page will show the “Download APK” section when that file exists.

For Play Store distribution, set **`APP_ANDROID_PLAY_STORE_URL`** in `.env` instead (or as well).

## 3. Checklist

- [ ] API base URL in the app matches production (`…/api/` or `…/mapi/` — same backend; see `docs/MOBILE_APP.md`).
- [ ] Play listing URL set if you use the store button.
- [ ] APK path correct if you enable sideload.

Legacy steps that used **Capacitor** + `npx cap sync android` are obsolete for this repository.
