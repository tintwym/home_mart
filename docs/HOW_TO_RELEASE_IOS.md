# How to release the Home Mart iOS app

The **Capacitor iOS shell** (`ios/` + `cap sync`) was **removed** from this repository so Android can ship as a **native Kotlin** app without a duplicate WebView wrapper.

## Current options

1. **Native iOS (recommended long term)**  
   Build a Swift/SwiftUI app in Xcode that uses the same **`/api/*`** endpoints as the website and Android.

2. **Restore Capacitor (legacy)**  
   If you still want a WebView-based iOS app, recover `ios/`, `capacitor.config.ts`, and `@capacitor/*` from git history and follow the old Capacitor docs.

## Website link

When you have a public link, set **`APP_IOS_STORE_URL`** in `.env`. The **`/download`** page will show an App Store / TestFlight button.

Apple does not allow arbitrary IPA downloads from your site for most users—use **TestFlight** or the **App Store**.
