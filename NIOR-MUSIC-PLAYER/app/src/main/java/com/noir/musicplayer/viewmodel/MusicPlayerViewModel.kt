package com.noir.musicplayer.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.noir.musicplayer.data.model.Playlist
import com.noir.musicplayer.data.model.Song
import com.noir.musicplayer.data.repository.MusicRepository
import com.noir.musicplayer.service.NiorMediaSessionService
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class MusicPlayerViewModel(private val repository: MusicRepository) : ViewModel() {

    private var mediaService: NiorMediaSessionService? = null

    val allSongs: StateFlow<List<Song>> = repository.allSongs
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val favoriteSongs: StateFlow<List<Song>> = repository.favoriteSongs
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val recentlyPlayed: StateFlow<List<Song>> = repository.recentlyPlayed
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val frequentlyPlayed: StateFlow<List<Song>> = repository.frequentlyPlayed
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allPlaylists: StateFlow<List<Playlist>> = repository.allPlaylists
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _isScanning = MutableStateFlow(false)
    val isScanning: StateFlow<Boolean> = _isScanning.asStateFlow()

    private val _themeMode = MutableStateFlow("dark")
    val themeMode: StateFlow<String> = _themeMode.asStateFlow()

    private val _accentColor = MutableStateFlow("purple")
    val accentColor: StateFlow<String> = _accentColor.asStateFlow()

    private val _isFullScreenPlayerVisible = MutableStateFlow(false)
    val isFullScreenPlayerVisible: StateFlow<Boolean> = _isFullScreenPlayerVisible.asStateFlow()

    private val _isEqualizerVisible = MutableStateFlow(false)
    val isEqualizerVisible: StateFlow<Boolean> = _isEqualizerVisible.asStateFlow()

    private val _currentSong = MutableStateFlow<Song?>(null)
    val currentSong: StateFlow<Song?> = _currentSong.asStateFlow()

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _currentPosition = MutableStateFlow(0L)
    val currentPosition: StateFlow<Long> = _currentPosition.asStateFlow()

    private val _duration = MutableStateFlow(0L)
    val duration: StateFlow<Long> = _duration.asStateFlow()

    private val _isShuffle = MutableStateFlow(false)
    val isShuffle: StateFlow<Boolean> = _isShuffle.asStateFlow()

    private val _repeatMode = MutableStateFlow(0) // 0: Off, 1: All, 2: One
    val repeatMode: StateFlow<Int> = _repeatMode.asStateFlow()

    fun connectMediaService(service: NiorMediaSessionService) {
        mediaService = service
        viewModelScope.launch {
            service.currentSong.collect { _currentSong.value = it }
        }
        viewModelScope.launch {
            service.isPlaying.collect { _isPlaying.value = it }
        }
        viewModelScope.launch {
            service.currentPosition.collect { _currentPosition.value = it }
        }
        viewModelScope.launch {
            service.duration.collect { _duration.value = it }
        }
    }

    fun scanMusic(context: Context) {
        viewModelScope.launch {
            _isScanning.value = true
            repository.rescanLibrary()
            _isScanning.value = false
        }
    }

    fun playSong(song: Song, queue: List<Song>) {
        val index = queue.indexOf(song).coerceAtLeast(0)
        mediaService?.playQueue(queue, index)
        viewModelScope.launch {
            repository.recordSongPlayed(song)
        }
    }

    fun shuffleAndPlay(songs: List<Song>) {
        if (songs.isEmpty()) return
        val shuffled = songs.shuffled()
        mediaService?.playQueue(shuffled, 0)
    }

    fun togglePlayPause() {
        mediaService?.playPause()
    }

    fun playNext() {
        mediaService?.playNext()
    }

    fun playPrevious() {
        mediaService?.playPrevious()
    }

    fun seekTo(positionMs: Long) {
        mediaService?.seekTo(positionMs)
    }

    fun toggleShuffle() {
        val newState = !_isShuffle.value
        _isShuffle.value = newState
        if (newState) {
            mediaService?.shuffleQueue()
        }
    }

    fun cycleRepeatMode() {
        _repeatMode.value = (_repeatMode.value + 1) % 3
    }

    fun toggleFavorite(song: Song) {
        viewModelScope.launch {
            repository.toggleFavorite(song)
        }
    }

    fun createPlaylist(name: String) {
        viewModelScope.launch {
            repository.createPlaylist(name)
        }
    }

    fun deletePlaylist(playlistId: Long) {
        viewModelScope.launch {
            repository.deletePlaylist(playlistId)
        }
    }

    fun getSongsInPlaylist(playlistId: Long): Flow<List<Song>> =
        repository.getSongsInPlaylist(playlistId)

    fun searchSongs(query: String): Flow<List<Song>> =
        repository.searchSongs(query)

    fun setFullScreenPlayer(visible: Boolean) {
        _isFullScreenPlayerVisible.value = visible
    }

    fun setEqualizer(visible: Boolean) {
        _isEqualizerVisible.value = visible
    }

    fun setThemeMode(mode: String) {
        _themeMode.value = mode
    }

    fun setAccentColor(color: String) {
        _accentColor.value = color
    }

    class Factory(private val repository: MusicRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return MusicPlayerViewModel(repository) as T
        }
    }
}
