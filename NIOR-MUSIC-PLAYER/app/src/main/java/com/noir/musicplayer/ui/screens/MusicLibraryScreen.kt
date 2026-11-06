package com.noir.musicplayer.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.noir.musicplayer.data.model.Song
import com.noir.musicplayer.ui.components.LiquidGlassCard
import com.noir.musicplayer.viewmodel.MusicPlayerViewModel

@Composable
fun MusicLibraryScreen(viewModel: MusicPlayerViewModel) {
    var selectedCategory by remember { mutableStateOf(0) } // 0: Songs, 1: Artists, 2: Albums
    var sortOption by remember { mutableStateOf("Title") } // Title, Artist, Album, Duration, Date
    var sortMenuExpanded by remember { mutableStateOf(false) }

    val allSongs by viewModel.allSongs.collectAsStateWithLifecycle()

    val sortedSongs = remember(allSongs, sortOption) {
        when (sortOption) {
            "Artist" -> allSongs.sortedBy { it.artist.lowercase() }
            "Album" -> allSongs.sortedBy { it.album.lowercase() }
            "Duration" -> allSongs.sortedByDescending { it.duration }
            "Date" -> allSongs.sortedByDescending { it.dateAdded }
            else -> allSongs.sortedBy { it.title.lowercase() }
        }
    }

    val artistsMap = remember(allSongs) {
        allSongs.groupBy { it.artist }
    }

    val albumsMap = remember(allSongs) {
        allSongs.groupBy { it.album }
    }

    var selectedArtist by remember { mutableStateOf<String?>(null) }
    var selectedAlbum by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .padding(top = 44.dp)
    ) {
        // Library Header & Sort
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Music Library",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Box {
                IconButton(onClick = { sortMenuExpanded = true }) {
                    Icon(
                        imageVector = Icons.Rounded.Sort,
                        contentDescription = "Sort",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                DropdownMenu(
                    expanded = sortMenuExpanded,
                    onDismissRequest = { sortMenuExpanded = false }
                ) {
                    listOf("Title", "Artist", "Album", "Duration", "Date").forEach { option ->
                        DropdownMenuItem(
                            text = { Text("Sort by $option") },
                            onClick = {
                                sortOption = option
                                sortMenuExpanded = false
                            }
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Categories Segmented Pill
        LiquidGlassCard(
            modifier = Modifier
                .fillMaxWidth()
                .height(44.dp),
            shape = RoundedCornerShape(22.dp)
        ) {
            Row(modifier = Modifier.fillMaxSize()) {
                listOf("Songs", "Artists", "Albums").forEachIndexed { index, title ->
                    val isSelected = selectedCategory == index
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight()
                            .padding(4.dp)
                            .clip(RoundedCornerShape(18.dp))
                            .background(
                                if (isSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.25f)
                                else Color.Transparent
                            )
                            .clickable {
                                selectedCategory = index
                                selectedArtist = null
                                selectedAlbum = null
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = title,
                            fontSize = 13.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Drill-down back navigation if an artist or album is opened
        if (selectedArtist != null) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { selectedArtist = null }
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Rounded.ArrowBack, contentDescription = "Back", tint = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = selectedArtist ?: "",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }

        if (selectedAlbum != null) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { selectedAlbum = null }
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Rounded.ArrowBack, contentDescription = "Back", tint = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = selectedAlbum ?: "",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }

        // List Content
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(bottom = 20.dp)
        ) {
            when (selectedCategory) {
                0 -> {
                    // All Songs View
                    items(sortedSongs, key = { it.id }) { song ->
                        SongRowItem(
                            song = song,
                            onClick = { viewModel.playSong(song, sortedSongs) },
                            onFavoriteToggle = { viewModel.toggleFavorite(song) }
                        )
                    }
                }
                1 -> {
                    // Artists View
                    if (selectedArtist == null) {
                        items(artistsMap.keys.toList(), key = { it }) { artist ->
                            val tracks = artistsMap[artist] ?: emptyList()
                            LiquidGlassCard(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { selectedArtist = artist }
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(44.dp)
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(Icons.Rounded.Person, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                                    }
                                    Spacer(modifier = Modifier.width(14.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(text = artist, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                                        Text(text = "${tracks.size} tracks", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                                    }
                                    Icon(Icons.Rounded.ChevronRight, contentDescription = null, tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f))
                                }
                            }
                        }
                    } else {
                        // Songs for selected artist
                        val artistSongs = artistsMap[selectedArtist] ?: emptyList()
                        items(artistSongs, key = { it.id }) { song ->
                            SongRowItem(
                                song = song,
                                onClick = { viewModel.playSong(song, artistSongs) },
                                onFavoriteToggle = { viewModel.toggleFavorite(song) }
                            )
                        }
                    }
                }
                2 -> {
                    // Albums View
                    if (selectedAlbum == null) {
                        items(albumsMap.keys.toList(), key = { it }) { album ->
                            val tracks = albumsMap[album] ?: emptyList()
                            val sample = tracks.firstOrNull()
                            LiquidGlassCard(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { selectedAlbum = album }
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    AsyncImage(
                                        model = sample?.getAlbumArtUri(),
                                        contentDescription = null,
                                        modifier = Modifier
                                            .size(46.dp)
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f))
                                    )
                                    Spacer(modifier = Modifier.width(14.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(text = album, fontWeight = FontWeight.SemiBold, fontSize = 15.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                        Text(text = "${sample?.artist ?: "Unknown"} • ${tracks.size} tracks", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                                    }
                                    Icon(Icons.Rounded.ChevronRight, contentDescription = null, tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f))
                                }
                            }
                        }
                    } else {
                        // Songs for selected album
                        val albumSongs = albumsMap[selectedAlbum] ?: emptyList()
                        items(albumSongs, key = { it.id }) { song ->
                            SongRowItem(
                                song = song,
                                onClick = { viewModel.playSong(song, albumSongs) },
                                onFavoriteToggle = { viewModel.toggleFavorite(song) }
                            )
                        }
                    }
                }
            }
        }
    }
}
