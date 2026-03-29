Place your signed release APK here as:
  homemart.apk

Then the /download page will offer it for download.

To build the APK:
  1. Open Android Studio: npx cap open android
  2. Build → Generate Signed Bundle / APK → APK (signed release)
  3. Copy the built APK to this folder and rename to homemart.apk:
     cp android/app/release/app-release.apk public/downloads/homemart.apk
     (Or sometimes: android/app/build/outputs/apk/release/app-release.apk)

See docs/MOBILE_APP.md for full instructions.
