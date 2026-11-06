package com.noir.musicplayer.data.repository

import android.content.Context
import com.noir.musicplayer.data.database.PlaylistDao
import com.noir.musicplayer.data.database.SongDao
import com.noir.musicplayer.data.model.Playlist
import com.noir.musicplayer.data.model.PlaylistSongCrossRef
import com.noir.musicplayer.data.model.Song
import com.noir.musicplayer.data.scanner.MediaScanner
import kotlinx.coroutines.flow.Flow

class MusicRepository(
    private val songDao: SongDao,
    private val playlistDao: PlaylistDao,
    context: Context
) {
    private val scanner = MediaScanner(context)

    val allSongs: Flow<List<Song>> = songDao.getAllSongs()
    val favoriteSongs: Flow<List<Song>> = songDao.getFavoriteSongs()
    val recentlyPlayed: Flow<List<Song>> = songDao.getRecentlyPlayed()
    val frequentlyPlayed: Flow<List<Song>> = songDao.getFrequentlyPlayed()
    val allPlaylists: Flow<List<Playlist>> = playlistDao.getAllPlaylists()

    suspend fun rescanLibrary(): Int {
        val detected = scanner.scanLocalAudio()
        if (detected.isNotEmpty()) {
            songDao.insertSongs(detected)
            val ids = detected.map { it.id }
            songDao.deleteRemovedSongs(ids)
        }
        return detected.size
    }

    suspend fun toggleFavorite(song: Song) {
        songDao.updateFavorite(song.id, !song.isFavorite)
    }

    suspend fun recordSongPlayed(song: Song) {
        songDao.incrementPlayCount(song.id)
    }

    fun searchSongs(query: String): Flow<List<Song>> = songDao.searchSongs(query)

    fun getSongsInPlaylist(playlistId: Long): Flow<List<Song>> =
        playlistDao.getSongsInPlaylist(playlistId)

    suspend fun createPlaylist(name: String): Long {
        return playlistDao.insertPlaylist(Playlist(name = name))
    }

    suspend fun renamePlaylist(playlistId: Long, newName: String) {
        playlistDao.renamePlaylist(playlistId, newName)
    }

    suspend fun deletePlaylist(playlistId: Long) {
        playlistDao.deletePlaylist(playlistId)
    }

    suspend fun addSongToPlaylist(playlistId: Long, songId: Long) {
        playlistDao.addSongToPlaylist(PlaylistSongCrossRef(playlistId, songId))
    }

    suspend fun removeSongFromPlaylist(playlistId: Long, songId: Long) {
        playlistDao.removeSongFromPlaylist(playlistId, songId)
    }
}
