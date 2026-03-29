# Publishing Home Mart to Google Play and App Store

This guide covers store mechanics for **native** mobile clients. The Laravel repo is the **backend + website**; **Android** is built separately (Kotlin in Android Studio). **iOS** is not generated from this repo anymore (the old Capacitor `ios/` shell was removed).

---

## Before you start

1. **Backend deployed**: Your Laravel API and site should be live at a public HTTPS URL (e.g. `https://your-site.com`). Native apps call **`/api/*`** (and may open the site in a browser for some flows).
2. **Android**: Open your Kotlin project in **Android Studio**; use the **applicationId** you registered in Play Console (e.g. `dev.tint_wym.homemart` or your own).
3. **iOS**: Use your own Xcode project (native or restored Capacitor from git history). Set **`APP_IOS_STORE_URL`** when you have an App Store or TestFlight link.

---

## Google Play Store (Android)

### 1. Create a Google Play Developer account

- Go to [Google Play Console](https://play.google.com/console).
- Sign in with a Google account and **register as a developer** (one-time **$25** registration fee).
- Accept the developer agreement.

### 2. Create the app in Play Console

- In Play Console: **All apps** → **Create app**.
- Fill in: App name (e.g. **Home Mart**), default language, app or game, free/paid.
- Accept declarations (e.g. policies, export compliance). You can complete required forms in the dashboard (e.g. **App content**).

### 3. Create an upload key (if you don’t have one)

You need a **keystore** to sign the Android app. Keep this file and passwords safe; you need them for all future updates.

**Option A – Let Android Studio create one (recommended for first time):**

1. Open your **native Android** project in Android Studio.
2. **Build** → **Generate Signed Bundle / APK**.
3. Choose **Android App Bundle** (recommended for Play Store).
4. Click **Create new...** under *Key store path* and choose a path (e.g. `homemart-upload-key.jks`).
5. Set a **Key store password** and **Key password**, and fill in **Alias**, **Password**, **Validity** (e.g. 25 years), and certificate details (name, org, city, country).
6. Finish the wizard; Android Studio will create the keystore and use it to sign the bundle.

**Option B – Create from command line:**

```bash
keytool -genkey -v -keystore homemart-upload-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias homemart
```

Store `homemart-upload-key.jks` and the passwords somewhere safe (e.g. password manager). Do not commit the keystore to git.

### 4. Build a release App Bundle (AAB)

1. **Build** → **Generate Signed Bundle / APK** → **Android App Bundle** → **Next**.
2. Select your keystore, enter passwords, select the key alias → **Next**.
3. Choose **release** build variant, click **Create**.
4. The AAB is created (e.g. `android/app/release/app-release.aab`).

### 5. Upload to Play Console

1. In Play Console, open your app → **Release** → **Production** (or **Testing** first).
2. **Create new release**.
3. **Upload** the `.aab` file.
4. Add **Release name** and **Release notes**.
5. **Review release** → **Start rollout to Production** (or save as draft).

### 6. Complete store listing and content

- **Main store listing**: Short and full description, screenshots (phone 16:9 or 9:16, min size), feature graphic, app icon.
- **App content**: Privacy policy URL, data safety form, and any other required declarations.
- **Pricing**: Set as free (or set price and countries).

After everything is complete and the release is rolled out, the app will go through review and then be available on the Play Store.

---

## Apple App Store (iOS)

### 1. Enroll in the Apple Developer Program

- Go to [Apple Developer](https://developer.apple.com/programs/).
- **Enroll** (requires an Apple ID). Paid membership is **$99/year**.
- Complete agreement and payment. Approval can take a day or two.

### 2. Create an app in App Store Connect

- Go to [App Store Connect](https://appstoreconnect.apple.com/) → **My Apps** → **+** → **New App**.
- Choose **iOS**, enter **Name** (e.g. Home Mart), **Primary Language**, **Bundle ID** (must match Xcode: e.g. `com.homemart.app`), **SKU** (e.g. `homemart-1`), **User Access** (Full Access).

### 3. Configure signing in Xcode

1. Open your **iOS** project in **Xcode** (native app or a restored Capacitor project).
2. In the left sidebar, select the **App** target (e.g. **App**).
3. Open **Signing & Capabilities**.
4. Check **Automatically manage signing**.
5. **Team**: Select your Apple Developer team (or add your Apple ID in Xcode → **Settings** → **Accounts**).
6. **Bundle Identifier** must match App Store Connect (e.g. `com.homemart.app`).

If you see signing errors, ensure the Bundle ID is registered in your Apple Developer account (it’s created when you create the app in App Store Connect, or you can register it under **Certificates, Identifiers & Profiles** → **Identifiers**).

### 4. Archive and upload

1. In Xcode, select **Any iOS Device (arm64)** as the run destination (not a simulator).
2. **Product** → **Archive**.
3. When the Organizer window opens, select the new archive → **Distribute App**.
4. **App Store Connect** → **Next** → **Upload** → **Next**.
5. Keep default options (e.g. upload symbols, manage version and build number) → **Next**.
6. After validation, choose **Upload**. Wait for the upload to finish.

### 5. Complete the listing in App Store Connect

- In App Store Connect, open your app → **App Store** tab.
- **Screenshots**: Required for at least one iPhone size (e.g. 6.7", 6.5", 5.5"). Use simulator or device.
- **Promotional Text** (optional), **Description**, **Keywords**, **Support URL**, **Marketing URL** (optional).
- **Build**: Click **+** and select the build you just uploaded (it may take a few minutes to appear).
- **App Privacy**: Link to your privacy policy and complete the privacy questionnaire.
- **Pricing**: Set price (e.g. Free) and availability.

### 6. Submit for review

- Choose the build, fill in **What’s New**, answer **Export Compliance**, **Content Rights**, **Advertising Identifier** if asked.
- Click **Add for Review** → **Submit to App Review**.

Apple typically reviews within 24–48 hours. After approval, the app goes live on the App Store (or you can set a manual release date).

---

## Checklist summary

| Step | Google Play | App Store |
|------|-------------|-----------|
| Account | Play Console, $25 one-time | Apple Developer, $99/year |
| Create app | Play Console → Create app | App Store Connect → New App |
| Signing | Upload keystore (create in Android Studio or keytool) | Xcode → Signing & Capabilities → Team |
| Build | Android Studio → Generate Signed Bundle (AAB) | Xcode → Archive → Distribute → Upload |
| Listing | Store listing, screenshots, content forms | Screenshots, description, build, privacy |
| Submit | Create release → Roll out | Submit for Review |

---

## Tips

- **Test first**: Use **Internal testing** (Play) and **TestFlight** (iOS) before going to production.
- **Icons**: Configure app icons in each native project (Android: `mipmap` resources; iOS: `Assets.xcassets` in Xcode).
- **Splash**: Optional; configure in each native project (Android: `SplashScreen` API / theme; iOS: storyboard or SwiftUI).
- **Privacy policy**: Both stores expect a URL; host one (e.g. `/privacy` on your Laravel app) and use it in both listings.
