package com.noir.musicplayer.audio

import android.media.audiofx.BassBoost
import android.media.audiofx.Equalizer
import android.util.Log

class EqualizerController {

    private var equalizer: Equalizer? = null
    private var bassBoost: BassBoost? = null

    var isEnabled: Boolean = false
        private set

    fun initialize(audioSessionId: Int) {
        try {
            release()
            equalizer = Equalizer(0, audioSessionId).apply {
                enabled = true
            }
            bassBoost = BassBoost(0, audioSessionId).apply {
                enabled = true
            }
            isEnabled = true
        } catch (e: Exception) {
            Log.e("EqualizerController", "Error initializing Equalizer: ${e.message}")
            isEnabled = false
        }
    }

    fun getNumberOfBands(): Short = equalizer?.numberOfBands ?: 5

    fun getBandLevelRange(): Pair<Short, Short> {
        val range = equalizer?.bandLevelRange ?: shortArrayOf(-1500, 1500)
        return Pair(range[0], range[1])
    }

    fun getCenterFreq(band: Short): Int = equalizer?.getCenterFreq(band) ?: 0

    fun getBandLevel(band: Short): Short = equalizer?.getBandLevel(band) ?: 0

    fun setBandLevel(band: Short, level: Short) {
        try {
            equalizer?.setBandLevel(band, level)
        } catch (e: Exception) {
            Log.e("EqualizerController", "Error setting band level: ${e.message}")
        }
    }

    fun setBassBoost(strength: Short) {
        try {
            bassBoost?.setStrength(strength)
        } catch (e: Exception) {
            Log.e("EqualizerController", "Error setting bass boost: ${e.message}")
        }
    }

    fun setPreset(presetIndex: Short) {
        try {
            equalizer?.usePreset(presetIndex)
        } catch (e: Exception) {
            Log.e("EqualizerController", "Error using preset: ${e.message}")
        }
    }

    fun release() {
        try {
            equalizer?.release()
            bassBoost?.release()
            equalizer = null
            bassBoost = null
            isEnabled = false
        } catch (e: Exception) {
            Log.e("EqualizerController", "Error releasing equalizer: ${e.message}")
        }
    }
}
