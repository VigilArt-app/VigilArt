# 📱 Android Device Testing Guide

This guide explains how to run and test this Flutter application on a physical Android device. It covers **Debug Mode** (for live development) and **Release Mode** (for testing the standalone APK).

---

## 🛠️ Step 1: Prepare Your Android Device

Before running any commands, you must prepare your phone to allow installations from your computer.

1. **Enable Developer Options:**
   * On your Android phone, go to **Settings** > **About phone**.
   * Scroll down and tap **Build number** **7 times** until you see the message: `"You are now a developer!"`.

2. **Enable USB Debugging:**
   * Go back to the main **Settings** menu.
   * Navigate to **System** > **Developer options** (or search for it in Settings).
   * Scroll down and turn **ON** **USB debugging**.

3. **Connect to your Computer:**
   * Plug your phone into your computer using a USB cable.
   * Look at your phone's screen. If a popup appears asking to allow USB debugging, check **"Always allow from this computer"** and tap **Allow**.

---

## ⚡ Method 1: Live Testing (Debug Mode)

1. Open your terminal and navigate to the project root directory.
2. Verify your computer recognizes your physical phone:
   ```bash
   flutter devices
   ```
3. Launch the app on your connected phone:
   ```bash
   flutter run
   ```

---

## Method 2: Standalone APK Testing (Release Mode)

1. Build the Release APK
```bash
flutter build apk --release
```
Once completed, the generated file will be located at:
📁 build/app/outputs/flutter-apk/app-release.apk

2. Install it on your device

Option A: Keep your phone plugged into the USB cable and run
```bash
flutter install
```

Option B: Manual Install
- Transfer the app-release.apk file to your phone (via USB, Google Drive, or email).

- On your phone, open your File Manager and tap the APK file.

- If prompted, allow your file manager permission to "Install unknown apps".

- Follow the on-screen prompts to complete the installation.


