package com.noir.musicplayer

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.noir.musicplayer.data.database.NiorDatabase
import com.noir.musicplayer.data.repository.MusicRepository

class NiorApplication : Application() {

    companion object {
        const val CHANNEL_ID = "nior_playback_channel"
        lateinit var instance: NiorApplication
            private set
    }

    val database by lazy { NiorDatabase.getDatabase(this) }
    val repository by lazy { MusicRepository(database.songDao(), database.playlistDao(), this) }

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "NIOR Audio Playback"
            val descriptionText = "Controls and media notification for background music playback"
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
                setShowBadge(false)
                lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }
}
