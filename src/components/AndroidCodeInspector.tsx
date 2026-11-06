import React, { useState } from 'react';
import { Download, FileCode, Check, Copy, X, Smartphone, Sparkles } from 'lucide-react';

interface Props {
  onClose: () => void;
  accentColorHex: string;
}

const ANDROID_FILES: Record<string, { title: string; language: string; description: string; code: string }> = {
  'NiorMediaSessionService.kt': {
    title: 'Background Playback Service',
    language: 'kotlin',
    description: 'AndroidX Media3 ExoPlayer service with lockscreen controls, notification, and audio focus.',
    code: `package com.noir.musicplayer.service

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioManager
import android.net.Uri
import android.os.Binder
import android.os.IBinder
import androidx.media3.common.*
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import com.noir.musicplayer.MainActivity
import com.noir.musicplayer.audio.EqualizerController
import com.noir.musicplayer.data.model.Song
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class NiorMediaSessionService : MediaSessionService() {

    private val binder = LocalBinder()
    lateinit var player: ExoPlayer
        private set
    private var mediaSession: MediaSession? = null
    val equalizerController = EqualizerController()

    private val _currentSong = MutableStateFlow<Song?>(null)
    val currentSong: StateFlow<Song?> = _currentSong

    override fun onCreate() {
        super.onCreate()
        val audioAttributes = AudioAttributes.Builder()
            .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
            .setUsage(C.USAGE_MEDIA)
            .build()

        player = ExoPlayer.Builder(this)
            .setAudioAttributes(audioAttributes, true)
            .setHandleAudioBecomingNoisy(true)
            .setWakeMode(C.WAKE_MODE_LOCAL)
            .build()

        equalizerController.initialize(player.audioSessionId)

        val activityIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, activityIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        mediaSession = MediaSession.Builder(this, player)
            .setSessionActivity(pendingIntent)
            .build()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? = mediaSession
}`
  },
  'MediaScanner.kt': {
    title: 'MediaStore Audio Scanner',
    language: 'kotlin',
    description: 'Extracts local MP3, M4A, FLAC, WAV, OGG metadata and album artwork using ContentResolver.',
    code: `package com.noir.musicplayer.data.scanner

import android.content.ContentResolver
import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import com.noir.musicplayer.data.model.Song
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class MediaScanner(private val context: Context) {
    suspend fun scanLocalAudio(): List<Song> = withContext(Dispatchers.IO) {
        val songList = mutableListOf<Song>()
        val contentResolver: ContentResolver = context.contentResolver

        val collection: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL)
        } else {
            MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
        }

        val projection = arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.TITLE,
            MediaStore.Audio.Media.ARTIST,
            MediaStore.Audio.Media.ALBUM,
            MediaStore.Audio.Media.DURATION,
            MediaStore.Audio.Media.ALBUM_ID,
            MediaStore.Audio.Media.DATE_ADDED
        )

        val selection = "\${MediaStore.Audio.Media.IS_MUSIC} != 0 AND \${MediaStore.Audio.Media.DURATION} >= 10000"
        contentResolver.query(collection, projection, selection, null, "\${MediaStore.Audio.Media.TITLE} ASC")?.use { cursor ->
            val idCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
            val titleCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
            val artistCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
            val albumCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
            val durCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
            val albumIdCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID)
            val dateCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATE_ADDED)

            while (cursor.moveToNext()) {
                val id = cursor.getLong(idCol)
                val contentUri = ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id)
                songList.add(
                    Song(
                        id = id,
                        title = cursor.getString(titleCol) ?: "Unknown Track",
                        artist = cursor.getString(artistCol) ?: "Unknown Artist",
                        album = cursor.getString(albumCol) ?: "Unknown Album",
                        duration = cursor.getLong(durCol),
                        albumId = cursor.getLong(albumIdCol),
                        contentUri = contentUri.toString(),
                        dateAdded = cursor.getLong(dateCol)
                    )
                )
            }
        }
        songList
    }
}`
  },
  'LiquidGlassBottomNav.kt': {
    title: 'Liquid Glass Navigation Pill',
    language: 'kotlin',
    description: 'Jetpack Compose sliding pill spring physics across Home, Music, Playlist, Settings, Search.',
    code: `package com.noir.musicplayer.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun LiquidGlassBottomNav(
    selectedTab: Int,
    onTabSelected: (Int) -> Unit
) {
    val animatedOffset by animateFloatAsState(
        targetValue = selectedTab.toFloat(),
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioLowBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "nav_pill_spring"
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(68.dp)
            .shadow(16.dp, RoundedCornerShape(34.dp))
            .clip(RoundedCornerShape(34.dp))
            .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.85f))
            .border(1.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(34.dp))
            .padding(6.dp)
    ) {
        BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
            val itemWidth = maxWidth / 5
            Box(
                modifier = Modifier
                    .width(itemWidth)
                    .fillMaxHeight()
                    .offset(x = itemWidth * animatedOffset)
                    .clip(RoundedCornerShape(28.dp))
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.35f))
                    .border(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.5f), RoundedCornerShape(28.dp))
            )
            // Tabs rendered above
        }
    }
}`
  },
  'AndroidManifest.xml': {
    title: 'Android Manifest & Permissions',
    language: 'xml',
    description: 'Storage permissions (READ_MEDIA_AUDIO), FOREGROUND_SERVICE_MEDIA_PLAYBACK, and Service bindings.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.noir.musicplayer">

    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <application
        android:name=".NiorApplication"
        android:label="NIOR"
        android:theme="@style/Theme.NiorMusicPlayer">

        <activity android:name=".MainActivity" android:exported="true" android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".service.NiorMediaSessionService"
            android:exported="true"
            android:foregroundServiceType="mediaPlayback">
            <intent-filter>
                <action android:name="androidx.media3.session.MediaSessionService" />
            </intent-filter>
        </service>
    </application>
</manifest>`
  },
  'build.gradle.kts': {
    title: 'Gradle Configuration',
    language: 'kotlin',
    description: 'Kotlin 2.0, Compose BOM, AndroidX Media3 1.5.0, Room 2.6.1 KSP, and Coil.',
    code: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("com.google.devtools.ksp")
}

android {
    namespace = "com.noir.musicplayer"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.noir.musicplayer"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures { compose = true }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.11.00"))
    implementation("androidx.compose.material3:material3")
    implementation("androidx.media3:media3-exoplayer:1.5.0")
    implementation("androidx.media3:media3-session:1.5.0")
    implementation("androidx.room:room-runtime:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")
    implementation("io.coil-kt:coil-compose:2.7.0")
}`
  }
};

export const AndroidCodeInspector: React.FC<Props> = ({ onClose, accentColorHex }) => {
  const [selectedFileName, setSelectedFileName] = useState<string>('NiorMediaSessionService.kt');
  const [copied, setCopied] = useState(false);

  const selectedFile = ANDROID_FILES[selectedFileName];

  const handleCopy = () => {
    if (selectedFile) {
      navigator.clipboard.writeText(selectedFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-4xl h-[88vh] rounded-[32px] text-white
                   bg-[#120F1D] border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.9)]
                   flex flex-col overflow-hidden"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/15"
              style={{ backgroundColor: `${accentColorHex}25`, color: accentColorHex }}
            >
              <Smartphone size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">NIOR Native Android Project</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Android 13/14/15
                </span>
              </div>
              <p className="text-xs text-white/50">Kotlin • Jetpack Compose • AndroidX Media3 • Room DB</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Download ZIP Button */}
            <a
              href="/nior-music-player.zip"
              download="nior-music-player-android.zip"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-transform active:scale-95"
              style={{ backgroundColor: accentColorHex }}
            >
              <Download size={15} />
              <span>Download Project (.ZIP)</span>
            </a>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Area: File Tabs Sidebar + Code Viewer */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* File Selector */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-3 bg-[#0D0B14]/80 overflow-y-auto no-scrollbar">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 px-3 py-1 block">
              Source Architecture
            </span>
            <div className="space-y-1 mt-1">
              {Object.entries(ANDROID_FILES).map(([filename, item]) => {
                const isSelected = selectedFileName === filename;
                return (
                  <button
                    key={filename}
                    onClick={() => setSelectedFileName(filename)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                      isSelected
                        ? 'bg-purple-900/30 border border-purple-500/40 text-purple-300 font-semibold'
                        : 'text-white/70 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <FileCode size={16} className={isSelected ? 'text-purple-400' : 'text-white/40'} />
                    <span className="truncate">{filename}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-white/60 space-y-1">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles size={13} style={{ color: accentColorHex }} />
                Offline Architecture
              </span>
              <p>All database queries and audio effect processing operate locally without internet permission.</p>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#0A0810]">
            {/* File Info Bar */}
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div>
                <span className="text-xs font-bold text-white">{selectedFile?.title}</span>
                <p className="text-[11px] text-white/50">{selectedFile?.description}</p>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white/80 hover:text-white transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 p-5 overflow-auto font-mono text-xs text-purple-200 leading-relaxed no-scrollbar select-text">
              <pre className="whitespace-pre">{selectedFile?.code}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
