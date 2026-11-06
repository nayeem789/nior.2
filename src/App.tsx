import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Smartphone,
  Maximize2,
  Wifi,
  BatteryCharging,
  Signal
} from 'lucide-react';
import { Song, Playlist, ThemeMode, AccentColor, RepeatMode } from './types/music';
import { storage } from './services/storage';
import { audioEngine } from './services/audioEngine';
import { LiquidGlassBottomNav } from './components/LiquidGlassBottomNav';
import { MiniPlayer } from './components/MiniPlayer';
import { FullScreenPlayer } from './components/FullScreenPlayer';
import { EqualizerModal } from './components/EqualizerModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { HomeScreen } from './screens/HomeScreen';
import { MusicLibraryScreen } from './screens/MusicLibraryScreen';
import { PlaylistScreen } from './screens/PlaylistScreen';
import { SearchScreen } from './screens/SearchScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const ACCENT_HEX_MAP: Record<AccentColor, string> = {
  purple: '#8B5CF6',
  blue: '#3B82F6',
  cyan: '#06B6D4',
  emerald: '#10B981',
  rose: '#F43F5E',
  amber: '#F59E0B'
};

export default function App() {
  // Load persistent settings
  const [settings, setSettings] = useState(storage.getSettings);
  const [songs, setSongs] = useState<Song[]>(() => storage.getSongs());
  const [playlists, setPlaylists] = useState<Playlist[]>(() => storage.getPlaylists());

  // Navigation tab (0: Home, 1: Music, 2: Playlist, 3: Settings, 4: Search)
  const [selectedTab, setSelectedTab] = useState<number>(0);

  // Playback state
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Song[]>([]);

  // Overlays & Modals
  const [isFullScreenPlayerOpen, setIsFullScreenPlayerOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<Song | null>(null);

  // Frame view mode: 'phone' or 'expanded'
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Current accent color hex
  const accentHex = useMemo(() => ACCENT_HEX_MAP[settings.accentColor] || '#8B5CF6', [settings.accentColor]);

  // Robust Theme Switching: Dark, Light, System
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (settings.themeMode === 'dark') {
        root.classList.add('dark');
      } else if (settings.themeMode === 'light') {
        root.classList.remove('dark');
      } else {
        // System mode: Follow device's OS preference
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();

    const listener = (e: MediaQueryListEvent) => {
      if (settings.themeMode === 'system') {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [settings.themeMode]);

  // Play song callback
  const playSong = useCallback((song: Song, targetQueue?: Song[]) => {
    const activeQueue = targetQueue && targetQueue.length > 0 ? targetQueue : songs;
    setQueue(activeQueue);
    setCurrentSong(song);
    setIsPlaying(true);

    // Update play metrics
    const updatedSongs = songs.map((s) => {
      if (s.id === song.id) {
        return {
          ...s,
          playCount: (s.playCount || 0) + 1,
          lastPlayed: Date.now()
        };
      }
      return s;
    });
    setSongs(updatedSongs);
    storage.saveSongs(updatedSongs);

    audioEngine.playSong(song);
  }, [songs]);

  // Audio engine time update & ended listener
  useEffect(() => {
    audioEngine.setCallbacks(
      (time, dur) => {
        setCurrentTime(time);
        setDuration(dur);
      },
      () => {
        // Track ended
        if (repeatMode === 'one' && currentSong) {
          audioEngine.seek(0);
          audioEngine.playSong(currentSong);
        } else {
          // Play next in queue
          handleNext();
        }
      }
    );
  }, [currentSong, queue, repeatMode]);

  const handlePlayPause = useCallback(() => {
    if (!currentSong && songs.length > 0) {
      playSong(songs[0], songs);
      return;
    }
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      audioEngine.resume();
      setIsPlaying(true);
    }
  }, [currentSong, isPlaying, songs, playSong]);

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === 'off') {
        setIsPlaying(false);
        return;
      }
      nextIndex = 0;
    }
    const nextSong = queue[nextIndex];
    if (nextSong) {
      playSong(nextSong, queue);
    }
  }, [queue, currentSong, repeatMode, playSong]);

  const handlePrevious = useCallback(() => {
    if (currentTime > 3) {
      audioEngine.seek(0);
      setCurrentTime(0);
      return;
    }
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
    const prevIndex = currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1;
    const prevSong = queue[prevIndex];
    if (prevSong) {
      playSong(prevSong, queue);
    }
  }, [currentTime, queue, currentSong, playSong]);

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  };

  const handleToggleShuffle = () => {
    const nextState = !isShuffle;
    setIsShuffle(nextState);
    if (nextState && currentSong) {
      const rest = queue.filter((s) => s.id !== currentSong.id);
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      setQueue([currentSong, ...rest]);
    }
  };

  const handleCycleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
    setRepeatMode(modes[nextIdx]);
  };

  const handleToggleFavorite = (song: Song) => {
    const updated = songs.map((s) => (s.id === song.id ? { ...s, isFavorite: !s.isFavorite } : s));
    setSongs(updated);
    storage.saveSongs(updated);
    if (currentSong?.id === song.id) {
      setCurrentSong({ ...currentSong, isFavorite: !currentSong.isFavorite });
    }
  };

  // Playlists management
  const handleCreatePlaylist = (name: string, songIdToAdd?: string) => {
    const newPlaylist: Playlist = {
      id: 'pl_' + Date.now(),
      name,
      createdAt: Date.now(),
      songIds: songIdToAdd ? [songIdToAdd] : []
    };
    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    storage.savePlaylists(updated);
  };

  const handleDeletePlaylist = (id: string) => {
    const updated = playlists.filter((p) => p.id !== id);
    setPlaylists(updated);
    storage.savePlaylists(updated);
  };

  const handleAddToPlaylist = (playlistId: string, songId: string) => {
    const updated = playlists.map((p) => {
      if (p.id === playlistId && !p.songIds.includes(songId)) {
        return { ...p, songIds: [...p.songIds, songId] };
      }
      return p;
    });
    setPlaylists(updated);
    storage.savePlaylists(updated);
  };

  const handleRemoveSongFromPlaylist = (playlistId: string, songId: string) => {
    const updated = playlists.map((p) => {
      if (p.id === playlistId) {
        return { ...p, songIds: p.songIds.filter((id) => id !== songId) };
      }
      return p;
    });
    setPlaylists(updated);
    storage.savePlaylists(updated);
  };

  // Local device media scanning via File API
  const handleScanMusic = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newSongs: Song[] = [];
    const validExts = ['.mp3', '.flac', '.wav', '.m4a', '.aac', '.ogg', '.opus'];

    Array.from(fileList).forEach((file, index) => {
      const isAudio =
        file.type.startsWith('audio/') ||
        validExts.some((ext) => file.name.toLowerCase().endsWith(ext));

      if (isAudio) {
        let cleanTitle = file.name.replace(/\.[^/.]+$/, '');
        let cleanArtist = 'Local Audio';

        if (cleanTitle.includes(' - ')) {
          const parts = cleanTitle.split(' - ');
          cleanArtist = parts[0].trim();
          cleanTitle = parts.slice(1).join(' - ').trim();
        }

        const objectUrl = URL.createObjectURL(file);

        newSongs.push({
          id: `local_${Date.now()}_${index}`,
          title: cleanTitle,
          artist: cleanArtist,
          album: 'Device Storage',
          duration: 180,
          audioUrl: objectUrl,
          file,
          isFavorite: false,
          playCount: 0,
          dateAdded: Date.now()
        });
      }
    });

    if (newSongs.length > 0) {
      const combined = [...newSongs, ...songs];
      setSongs(combined);
      storage.saveSongs(combined);
      setSelectedTab(1);
    }
  };

  // Settings updates
  const handleThemeModeChange = (mode: ThemeMode) => {
    const updated = { ...settings, themeMode: mode };
    setSettings(updated);
    storage.saveSettings(updated);
  };

  const handleAccentColorChange = (color: AccentColor) => {
    const updated = { ...settings, accentColor: color };
    setSettings(updated);
    storage.saveSettings(updated);
  };

  const handleToggleHighQuality = () => {
    const updated = { ...settings, highQuality: !settings.highQuality };
    setSettings(updated);
    storage.saveSettings(updated);
  };

  const handleToggleRememberLastPlayed = () => {
    const updated = { ...settings, rememberLastPlayed: !settings.rememberLastPlayed };
    setSettings(updated);
    storage.saveSettings(updated);
  };

  // Computed data for Home
  const recentlyPlayed = useMemo(() => {
    return [...songs]
      .filter((s) => s.lastPlayed && s.lastPlayed > 0)
      .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
  }, [songs]);

  const frequentlyPlayed = useMemo(() => {
    return [...songs]
      .filter((s) => s.playCount && s.playCount > 0)
      .sort((a, b) => b.playCount - a.playCount);
  }, [songs]);

  return (
    <div className="min-h-screen bg-[#F5F4F9] dark:bg-[#07050A] text-[#191624] dark:text-white flex flex-col font-sans select-none antialiased transition-colors duration-200">
      {/* Top Universal Companion Control Bar */}
      <header className="h-13 bg-white/80 dark:bg-[#110E1C]/90 backdrop-blur-xl border-b border-black/[0.08] dark:border-white/10 px-4 sm:px-6 flex items-center justify-between z-40 shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-sm"
            style={{ backgroundColor: accentHex }}
          >
            N
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#191624] dark:text-white tracking-wide">
            NIOR MUSIC PLAYER
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/5 hover:bg-black/[0.08] dark:hover:bg-white/10 border border-black/[0.08] dark:border-white/10 text-xs text-[#191624]/80 dark:text-white/80 transition-colors"
            title={isPhoneFrame ? 'Switch to Full Window' : 'Switch to Phone View'}
          >
            {isPhoneFrame ? <Maximize2 size={13} /> : <Smartphone size={13} />}
            <span className="hidden sm:inline">
              {isPhoneFrame ? 'Full Window' : 'Phone View'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 flex items-center justify-center p-0 sm:p-4 overflow-hidden">
        <div
          className={`relative flex flex-col overflow-hidden transition-all duration-300 ${
            isPhoneFrame
              ? 'w-full max-w-[420px] h-[100dvh] sm:h-[880px] sm:max-h-[92vh] sm:rounded-[52px] sm:border-[8px] sm:border-slate-300/80 dark:sm:border-[#262235] sm:shadow-[0_25px_70px_rgba(0,0,0,0.15)] dark:sm:shadow-[0_25px_70px_rgba(0,0,0,0.95)]'
              : 'w-full max-w-4xl h-[100dvh] sm:h-[860px] sm:rounded-[36px] sm:border sm:border-black/[0.08] dark:sm:border-white/10'
          } bg-[#F5F4F9] dark:bg-[#0D0B14] transition-colors`}
        >
          {/* Mobile Status Bar (shown when in phone frame) */}
          <div className="h-10 px-7 flex items-center justify-between text-xs text-[#191624]/75 dark:text-white/70 pt-2 shrink-0 z-30 select-none">
            <span className="font-semibold text-[13px] tracking-tight">09:41</span>
            {/* Center Hole Punch Camera */}
            <div className="w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-black border border-slate-400/40 dark:border-white/20 shadow-inner" />
            <div className="flex items-center gap-2">
              <Signal size={13} />
              <span className="text-[10px] font-bold">5G</span>
              <Wifi size={13} />
              <BatteryCharging size={14} />
            </div>
          </div>

          {/* Active Screen Body */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            {selectedTab === 0 && (
              <HomeScreen
                songs={songs}
                playlists={playlists}
                recentlyPlayed={recentlyPlayed}
                frequentlyPlayed={frequentlyPlayed}
                onPlaySong={playSong}
                onToggleFavorite={handleToggleFavorite}
                onNavigateToSongs={() => setSelectedTab(1)}
                onNavigateToPlaylists={() => setSelectedTab(2)}
                onScanMusic={handleScanMusic}
                accentColorHex={accentHex}
              />
            )}

            {selectedTab === 1 && (
              <MusicLibraryScreen
                songs={songs}
                onPlaySong={playSong}
                onToggleFavorite={handleToggleFavorite}
                onOpenAddToPlaylist={(song) => {
                  setSongToAddToPlaylist(song);
                  setIsAddToPlaylistOpen(true);
                }}
                accentColorHex={accentHex}
              />
            )}

            {selectedTab === 2 && (
              <PlaylistScreen
                playlists={playlists}
                songs={songs}
                onPlaySong={playSong}
                onShuffleQueue={(shuffled) => {
                  const s = [...shuffled].sort(() => Math.random() - 0.5);
                  playSong(s[0], s);
                }}
                onCreatePlaylist={handleCreatePlaylist}
                onDeletePlaylist={handleDeletePlaylist}
                onRemoveSongFromPlaylist={handleRemoveSongFromPlaylist}
                onToggleFavorite={handleToggleFavorite}
                accentColorHex={accentHex}
              />
            )}

            {selectedTab === 3 && (
              <SettingsScreen
                themeMode={settings.themeMode}
                accentColor={settings.accentColor}
                highQuality={settings.highQuality}
                rememberLastPlayed={settings.rememberLastPlayed}
                songs={songs}
                playlists={playlists}
                onThemeModeChange={handleThemeModeChange}
                onAccentColorChange={handleAccentColorChange}
                onToggleHighQuality={handleToggleHighQuality}
                onToggleRememberLastPlayed={handleToggleRememberLastPlayed}
                onOpenEqualizer={() => setIsEqualizerOpen(true)}
                onScanMusic={handleScanMusic}
                accentColorHex={accentHex}
              />
            )}

            {selectedTab === 4 && (
              <SearchScreen
                songs={songs}
                onPlaySong={playSong}
                onToggleFavorite={handleToggleFavorite}
                accentColorHex={accentHex}
              />
            )}

            {/* Floating Mini Player & Bottom Navigation Layer */}
            <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none pb-4">
              {currentSong && (
                <MiniPlayer
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  onPlayPause={handlePlayPause}
                  onNext={handleNext}
                  onClick={() => setIsFullScreenPlayerOpen(true)}
                  accentColorHex={accentHex}
                />
              )}

              <LiquidGlassBottomNav
                selectedTab={selectedTab}
                onSelectTab={setSelectedTab}
                accentColorHex={accentHex}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Full-Screen Music Player Modal */}
      {isFullScreenPlayerOpen && currentSong && (
        <FullScreenPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          isShuffle={isShuffle}
          repeatMode={repeatMode}
          queue={queue}
          onClose={() => setIsFullScreenPlayerOpen(false)}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSeek={handleSeek}
          onToggleFavorite={handleToggleFavorite}
          onToggleShuffle={handleToggleShuffle}
          onCycleRepeat={handleCycleRepeat}
          onOpenEqualizer={() => setIsEqualizerOpen(true)}
          onOpenAddToPlaylist={() => {
            setSongToAddToPlaylist(currentSong);
            setIsAddToPlaylistOpen(true);
          }}
          onSelectQueueSong={(song) => playSong(song, queue)}
          accentColorHex={accentHex}
        />
      )}

      {/* 5-Band Equalizer Modal */}
      {isEqualizerOpen && (
        <EqualizerModal
          onClose={() => setIsEqualizerOpen(false)}
          accentColorHex={accentHex}
        />
      )}

      {/* Add To Playlist Modal */}
      {isAddToPlaylistOpen && songToAddToPlaylist && (
        <AddToPlaylistModal
          song={songToAddToPlaylist}
          playlists={playlists}
          onAddToPlaylist={handleAddToPlaylist}
          onCreatePlaylist={handleCreatePlaylist}
          onClose={() => {
            setIsAddToPlaylistOpen(false);
            setSongToAddToPlaylist(null);
          }}
          accentColorHex={accentHex}
        />
      )}
    </div>
  );
}
