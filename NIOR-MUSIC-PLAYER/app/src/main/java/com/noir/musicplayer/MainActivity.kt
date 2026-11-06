package com.noir.musicplayer

import android.Manifest
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.noir.musicplayer.service.NiorMediaSessionService
import com.noir.musicplayer.ui.components.LiquidGlassBottomNav
import com.noir.musicplayer.ui.components.MiniPlayer
import com.noir.musicplayer.ui.screens.*
import com.noir.musicplayer.ui.theme.NiorMusicPlayerTheme
import com.noir.musicplayer.viewmodel.MusicPlayerViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: MusicPlayerViewModel by viewModels {
        MusicPlayerViewModel.Factory((application as NiorApplication).repository)
    }

    private var mediaService: NiorMediaSessionService? = null
    private var isBound = false

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as? NiorMediaSessionService.LocalBinder
            mediaService = binder?.getService()
            isBound = true
            mediaService?.let { viewModel.connectMediaService(it) }
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            mediaService = null
            isBound = false
        }
    }

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions.entries.all { it.value }
        if (granted) {
            viewModel.scanMusic(this)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        checkAndRequestPermissions()

        val serviceIntent = Intent(this, NiorMediaSessionService::class.java)
        startService(serviceIntent)
        bindService(serviceIntent, serviceConnection, Context.BIND_AUTO_CREATE)

        setContent {
            val themeMode by viewModel.themeMode.collectAsStateWithLifecycle()
            val accentColor by viewModel.accentColor.collectAsStateWithLifecycle()
            val isDark = when (themeMode) {
                "light" -> false
                "dark" -> true
                else -> isSystemInDarkTheme()
            }

            NiorMusicPlayerTheme(darkTheme = isDark, accentColor = accentColor) {
                MainContent(viewModel = viewModel)
            }
        }
    }

    private fun checkAndRequestPermissions() {
        val permissions = mutableListOf<String>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.READ_MEDIA_AUDIO)
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            permissions.add(Manifest.permission.READ_EXTERNAL_STORAGE)
        }

        val needed = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (needed.isNotEmpty()) {
            permissionLauncher.launch(needed.toTypedArray())
        } else {
            viewModel.scanMusic(this)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (isBound) {
            unbindService(serviceConnection)
            isBound = false
        }
    }
}

@Composable
fun MainContent(viewModel: MusicPlayerViewModel) {
    var currentTab by remember { mutableStateOf(0) }
    val currentSong by viewModel.currentSong.collectAsStateWithLifecycle()
    val isPlaying by viewModel.isPlaying.collectAsStateWithLifecycle()
    val isFullScreenPlayerVisible by viewModel.isFullScreenPlayerVisible.collectAsStateWithLifecycle()
    val isEqualizerVisible by viewModel.isEqualizerVisible.collectAsStateWithLifecycle()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Main Screen Content
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = if (currentSong != null) 140.dp else 90.dp)
        ) {
            when (currentTab) {
                0 -> HomeScreen(
                    viewModel = viewModel,
                    onNavigateToSongs = { currentTab = 1 },
                    onNavigateToPlaylists = { currentTab = 2 }
                )
                1 -> MusicLibraryScreen(viewModel = viewModel)
                2 -> PlaylistScreen(viewModel = viewModel)
                3 -> SettingsScreen(viewModel = viewModel)
                4 -> SearchScreen(viewModel = viewModel)
            }
        }

        // Floating Mini Player & Floating Bottom Navigation Stack
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(bottom = 16.dp, start = 16.dp, end = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            AnimatedVisibility(
                visible = currentSong != null,
                enter = slideInVertically { it } + fadeIn(),
                exit = slideOutVertically { it } + fadeOut()
            ) {
                currentSong?.let { song ->
                    MiniPlayer(
                        song = song,
                        isPlaying = isPlaying,
                        onPlayPause = { viewModel.togglePlayPause() },
                        onNext = { viewModel.playNext() },
                        onClick = { viewModel.setFullScreenPlayer(true) }
                    )
                }
            }

            // Real Animated Sliding Pill Navigation
            LiquidGlassBottomNav(
                selectedTab = currentTab,
                onTabSelected = { currentTab = it }
            )
        }

        // Full Screen Player Sheet / Overlay
        AnimatedVisibility(
            visible = isFullScreenPlayerVisible,
            enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
            exit = slideOutVertically(targetOffsetY = { it }) + fadeOut()
        ) {
            PlayerScreen(
                viewModel = viewModel,
                onClose = { viewModel.setFullScreenPlayer(false) },
                onOpenEqualizer = { viewModel.setEqualizer(true) }
            )
        }

        // Equalizer Overlay
        AnimatedVisibility(
            visible = isEqualizerVisible,
            enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
            exit = slideOutVertically(targetOffsetY = { it }) + fadeOut()
        ) {
            EqualizerScreen(
                viewModel = viewModel,
                onClose = { viewModel.setEqualizer(false) }
            )
        }
    }
}
