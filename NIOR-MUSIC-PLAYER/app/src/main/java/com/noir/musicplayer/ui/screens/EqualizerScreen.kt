package com.noir.musicplayer.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.noir.musicplayer.ui.components.LiquidGlassCard
import com.noir.musicplayer.viewmodel.MusicPlayerViewModel

@Composable
fun EqualizerScreen(
    viewModel: MusicPlayerViewModel,
    onClose: () -> Unit
) {
    var isEnabled by remember { mutableStateOf(true) }
    var selectedPreset by remember { mutableStateOf("Normal") }
    val presets = listOf("Normal", "Bass Boost", "Treble", "Vocal", "Rock", "Jazz", "Electronic", "Acoustic")

    var bassBoostValue by remember { mutableStateOf(50f) }
    val bands = remember {
        mutableStateListOf(0f, 0f, 0f, 0f, 0f) // 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background.copy(alpha = 0.98f))
            .padding(20.dp)
            .padding(top = 40.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onClose) {
                    Icon(
                        imageVector = Icons.Rounded.Close,
                        contentDescription = "Close",
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }

                Text(
                    text = "AUDIO EQUALIZER",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.sp,
                    color = MaterialTheme.colorScheme.primary
                )

                IconButton(onClick = {
                    bands.indices.forEach { bands[it] = 0f }
                    bassBoostValue = 0f
                    selectedPreset = "Normal"
                }) {
                    Icon(
                        imageVector = Icons.Rounded.Refresh,
                        contentDescription = "Reset",
                        tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }
            }

            // Power Switch Card
            LiquidGlassCard(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Equalizer Power", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        Text(
                            if (isEnabled) "Active hardware audio effects" else "Hardware bypass",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    }
                    Switch(
                        checked = isEnabled,
                        onCheckedChange = { isEnabled = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = MaterialTheme.colorScheme.primary)
                    )
                }
            }

            // Presets Horizontal Row
            Column {
                Text(
                    text = "Presets",
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
                Spacer(modifier = Modifier.height(8.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    itemsIndexed(presets) { _, preset ->
                        val isSelected = selectedPreset == preset
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(14.dp))
                                .background(
                                    if (isSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)
                                    else Color.White.copy(alpha = 0.06f)
                                )
                                .clickable {
                                    selectedPreset = preset
                                    when (preset) {
                                        "Bass Boost" -> {
                                            bassBoostValue = 85f
                                            bands[0] = 6f
                                            bands[1] = 4f
                                        }
                                        "Treble" -> {
                                            bands[3] = 5f
                                            bands[4] = 7f
                                        }
                                        "Vocal" -> {
                                            bands[1] = 2f
                                            bands[2] = 5f
                                            bands[3] = 3f
                                        }
                                        "Rock" -> {
                                            bands[0] = 5f
                                            bands[1] = 3f
                                            bands[2] = -1f
                                            bands[3] = 3f
                                            bands[4] = 6f
                                        }
                                        else -> {
                                            bands.indices.forEach { bands[it] = 0f }
                                        }
                                    }
                                }
                                .padding(horizontal = 14.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = preset,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }

            // 5-Band Vertical Frequency Sliders
            LiquidGlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp)
            ) {
                val freqs = listOf("60Hz", "230Hz", "910Hz", "3.6kHz", "14kHz")
                Row(
                    modifier = Modifier.fillMaxSize().padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    bands.forEachIndexed { index, level ->
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxHeight()
                        ) {
                            Text(
                                text = "${if (level > 0) "+" else ""}${level.toInt()}dB",
                                fontSize = 10.sp,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Slider(
                                value = level,
                                onValueChange = { bands[index] = it },
                                valueRange = -10f..10f,
                                modifier = Modifier
                                    .weight(1f)
                                    .width(100.dp)
                            )
                            Text(
                                text = freqs[index],
                                fontSize = 10.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                            )
                        }
                    }
                }
            }

            // Bass Boost Slider
            LiquidGlassCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Bass Boost", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                        Text("${bassBoostValue.toInt()}%", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 14.sp)
                    }
                    Slider(
                        value = bassBoostValue,
                        onValueChange = { bassBoostValue = it },
                        valueRange = 0f..100f,
                        colors = SliderDefaults.colors(thumbColor = MaterialTheme.colorScheme.primary)
                    )
                }
            }
        }
    }
}
