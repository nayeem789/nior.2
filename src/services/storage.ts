import { Playlist, Song, ThemeMode, AccentColor } from '../types/music';

const SONGS_KEY = 'nior_songs_v2';
const PLAYLISTS_KEY = 'nior_playlists_v2';
const SETTINGS_KEY = 'nior_settings_v2';

export interface AppSettings {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  highQuality: boolean;
  rememberLastPlayed: boolean;
  lastPlayedSongId?: string;
  lastPlayedTime?: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'dark',
  accentColor: 'purple',
  highQuality: true,
  rememberLastPlayed: true
};

export const storage = {
  getSongs(): Song[] {
    try {
      // Clear out any old v1 demo storage if present
      localStorage.removeItem('nior_songs_v1');
      const data = localStorage.getItem(SONGS_KEY);
      if (!data) return [];
      const parsed: Song[] = JSON.parse(data);
      // Filter out any lingering fake demo tracks
      return parsed.filter((s) => !s.id.startsWith('nior_track_'));
    } catch {
      return [];
    }
  },

  saveSongs(songs: Song[]) {
    try {
      const clean = songs.map(({ file, ...rest }) => rest);
      localStorage.setItem(SONGS_KEY, JSON.stringify(clean));
    } catch (e) {
      console.warn('Failed to save songs to localStorage', e);
    }
  },

  getPlaylists(): Playlist[] {
    try {
      localStorage.removeItem('nior_playlists_v1');
      const data = localStorage.getItem(PLAYLISTS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  savePlaylists(playlists: Playlist[]) {
    try {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
    } catch (e) {
      console.warn('Failed to save playlists', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }
};
