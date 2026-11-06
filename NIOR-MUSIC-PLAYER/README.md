# NIOR MUSIC PLAYER
## Complete Native Android Studio Project (Kotlin & Jetpack Compose)

A premium, fully offline personal music player designed for modern Android smartphones and tablets running Android 13/14/15.

### Key Highlights
- **100% Offline & Private**: Zero internet permissions, zero analytics, zero external dependencies. All audio metadata, play counts, favorites, and playlists are stored locally on-device.
- **iOS-Inspired Liquid Glass UI**: Translucent layered cards, frosted glass surfaces, soft ambient purple glow, and fluid spring animations.
- **Floating Liquid Glass Bottom Navigation with Sliding Selection Pill**: Features real animated spring physics moving smoothly between the 5 tabs: **Home, Music, Playlist, Settings, and Search**.
- **Persistent Floating Mini Player**: Floats above the bottom navigation bar and synchronizes with full-screen playback.
- **AndroidX Media3 ExoPlayer Engine**: Continuous background audio playback via `MediaSessionService`, lockscreen media controls, Bluetooth routing, and audio focus management.
- **5-Band Hardware Equalizer & Bass Boost**: Real audio-fx integration connected directly to ExoPlayer audio session ID.
- **Room Database Architecture**: Fully relational schema for songs, playlists, playlist-song cross-references, favorites, and recently/frequently played metrics.
- **Automatic MediaStore Music Scanner**: Scans internal and removable storage for MP3, M4A, AAC, FLAC, WAV, OGG, and OPUS formats.

---

### Project Structure
```
NIOR-MUSIC-PLAYER/
├── app/
│   ├── src/main/
│   │   ├── java/com/noir/musicplayer/
│   │   │   ├── MainActivity.kt
│   │   │   ├── NiorApplication.kt
│   │   │   ├── audio/EqualizerController.kt
│   │   │   ├── data/database/NiorDatabase.kt, SongDao.kt, PlaylistDao.kt
│   │   │   ├── data/model/Song.kt, Playlist.kt
│   │   │   ├── data/repository/MusicRepository.kt
│   │   │   ├── data/scanner/MediaScanner.kt
│   │   │   ├── service/NiorMediaSessionService.kt
│   │   │   ├── ui/components/LiquidGlass.kt, LiquidGlassBottomNav.kt, MiniPlayer.kt
│   │   │   ├── ui/screens/HomeScreen.kt, MusicLibraryScreen.kt, PlaylistScreen.kt,
│   │   │   │              SearchScreen.kt, SettingsScreen.kt, PlayerScreen.kt, EqualizerScreen.kt
│   │   │   ├── ui/theme/Color.kt, Theme.kt, Type.kt
│   │   │   └── viewmodel/MusicPlayerViewModel.kt
│   │   ├── res/
│   │   │   ├── values/strings.xml, colors.xml, themes.xml
│   │   │   └── drawable/ic_nior_logo.xml
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
├── gradle/wrapper/gradle-wrapper.properties
├── settings.gradle.kts
├── build.gradle.kts
├── gradle.properties
└── README.md
```

---

### Step-by-Step Build Instructions

1. **Prerequisites**:
   - Android Studio Koala / Ladybug or newer.
   - JDK 17 or JDK 21 configured as the Gradle JDK.
   - Android SDK 35 (Platform 35).

2. **Open Project**:
   - Extract the project zip.
   - Open Android Studio -> Click **Open** -> Select the **NIOR-MUSIC-PLAYER** root folder.

3. **Sync Gradle**:
   - Android Studio will automatically sync dependencies. If needed, click **Sync Project with Gradle Files**.

4. **Build APK**:
   - In Android Studio: Click **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
   - Or run from terminal:
     ```bash
     ./gradlew assembleDebug
     ```
   - The compiled debug APK will be generated at:
     `app/build/outputs/apk/debug/app-debug.apk`

5. **Install on Android Device**:
   - Enable **Developer Options** and **USB Debugging** on your Android device.
   - Connect your phone via USB and click **Run** (Green Play button) in Android Studio, or execute:
     ```bash
     adb install app/build/outputs/apk/debug/app-debug.apk
     ```

---

### Architecture & Performance Tuning
- High-refresh rate 120Hz display optimization: Spring animations tuned with low damping ratio to avoid micro-stutters.
- Storage permission handling: Uses `READ_MEDIA_AUDIO` on Android 13+ without requesting legacy broad storage.
- Power saving exemption: Foreground service declaration with `FOREGROUND_SERVICE_MEDIA_PLAYBACK` ensures uninterrupted playback even under aggressive OS battery management.
