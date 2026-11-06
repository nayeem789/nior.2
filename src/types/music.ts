export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  albumArt?: string;
  audioUrl?: string; // object URL or synthesized
  isFavorite: boolean;
  playCount: number;
  lastPlayed?: number;
  dateAdded: number;
  file?: File;
}

export interface Playlist {
  id: string;
  name: string;
  createdAt: number;
  songIds: string[];
}

export type SortOption = 'title' | 'artist' | 'album' | 'duration' | 'date';
export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'purple' | 'blue' | 'cyan' | 'emerald' | 'rose' | 'amber';
export type RepeatMode = 'off' | 'all' | 'one';
