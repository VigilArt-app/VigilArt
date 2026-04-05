# 📱 VigilArt - Android Emulator Setup Guide

To ensure everyone on the team has a smooth development experience without overloading their computers, please follow this guide to set up the standard VigilArt Android Emulator using Android Studio.

We use **Android 9.0 (API 28)** with **Quick Boot** enabled to save CPU and RAM.

---

## 🛠 Step 1: Install Android Studio

1. Download and install [Android Studio](https://developer.android.com/studio).
2. Open Android Studio and complete the initial setup wizard (let it install the default SDK components).

---

## 📱 Step 2: Create the Virtual Device

1. Open Android Studio and click on **More Actions** (the three dots icon) on the welcome screen.
2. Select **Virtual Device Manager**.
3. Click the **Create device** button (top left).
4. **Choose Hardware:** * Select the **Phone** category.
   * Choose a standard phone like **Pixel 6** (or any medium phone profile with a 1080x2400 resolution).
   * Click **Next**.
5. **System Image:**
   * Look for **Pie** (API Level **28**, x86_64) with the **Google Play** icon next to it.
   * Click the downward arrow next to "Pie" to download it if you haven't already.
   * Select it and click **Next**.

---

## ⚙️ Step 3: Configure VigilArt Settings (Important!)

On the final "Verify Configuration" screen, click **Show Advanced Settings** at the bottom to adjust the performance settings:

1. **AVD Name:** Name it something recognizable, like `VigilArt_Emulator`.
2. **Boot Option:** * Select **Quick boot**. *(Crucial: Do not select "Cold boot", as it forces a heavy CPU restart every time!)*
3. **Memory and Storage:**
   * **RAM:** `2048 MB`
   * **VM heap:** `228 MB`
   * **Internal Storage:** `6000 MB` (6 GB)
4. **Camera:**
   * Front: `Emulated`
   * Back: `VirtualScene`
5. Click **Finish**. Your emulator is now ready!

---

## 🚀 Step 4: How to Launch for Development (VS Code)

To avoid CPU spikes, **always launch the emulator before starting your app**.

1. Open your VigilArt mobile project in **VS Code**.
2. Look at the bottom right corner of the blue VS Code status bar. Click on the device selector (it usually says "No Device", "Windows", or "Linux").
3. A dropdown menu will appear at the top of VS Code. Select your newly created **`VigilArt_Emulator`**.
4. The emulator will open instantly using its cached state (Quick Boot).
5. Once the phone is fully displayed on your screen, open your VS Code terminal and run:
   ```bash
   flutter run
   ```