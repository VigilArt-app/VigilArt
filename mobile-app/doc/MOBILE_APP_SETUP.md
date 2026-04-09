# 📱 VigilArt - Mobile App Development Guide

Welcome to the VigilArt mobile app! This guide covers everything you need to set up your local environment, install dependencies, and launch the application on an Android emulator.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:
1. **[Flutter SDK](https://docs.flutter.dev/get-started/install)** (Ensure running `flutter doctor` in your terminal shows no major errors)
2. **[Android Studio](https://developer.android.com/studio)** (Required for the Android SDK and Emulator)
3. **Git**
4. **VS Code** (Recommended, with the standard Flutter and Dart extensions installed)

---

## Step 1: Clone and Setup the Repository

1. Clone the main repository to your local machine:
```bash
   git clone <your-repo-url>
   cd VigilArt
```

2. Navigate specifically into the mobile app directory:

```bash
cd mobile-app
```
## 📦 Step 2: Install Dependencies

Once inside the mobile-app folder, download and install all the required Flutter packages:

```bash
flutter pub get
```

## 🚀 Step 3: Launch the app

Before running the application, you must have a connected physical device or a running Android emulator.

👉 Emulator Setup: If you have not configured your emulator yet, please refer to the Emulator Setup Guide (```EMULATOR_SETUP.md```) for the required performance settings and launch instructions.

Once your emulator or device is running, launch the app using:

```bash
flutter run
```

🆘 Troubleshooting

Use the newt commands:
```bash
flutter clean
flutter pub get
flutter run 
```
