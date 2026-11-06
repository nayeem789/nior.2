import React, { useRef } from 'react';
import { Music2, ListMusic, RefreshCw, FolderOpen, Heart, Play } from 'lucide-react';
import { Song, Playlist } from '../types/music';

interface Props {
  songs: Song[];
  playlists: Playlist[];
  recentlyPlayed: Song[];
  frequentlyPlayed: Song[];
  onPlaySong: (song: Song, queue: Song[]) => void;
  onToggleFavorite: (song: Song) => void;
  onNavigateToSongs: () => void;
  onNavigateToPlaylists: () => void;
  onScanMusic: (files: FileList | null) => void;
  accentColorHex: string;
}

export const HomeScreen: React.FC<Props> = ({
  songs,
  playlists,
  recentlyPlayed,
  frequentlyPlayed,
  onPlaySong,
  onToggleFavorite,
  onNavigateToSongs,
  onNavigateToPlaylists,
  onScanMusic,
  accentColorHex
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-8 pb-32 space-y-7">
      {/* Hidden file inputs for local device audio scanning */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="audio/*,.mp3,.flac,.wav,.m4a,.aac,.ogg,.opus"
        className="hidden"
        onChange={(e) => onScanMusic(e.target.files)}
      />
      <input
        type="file"
        ref={folderInputRef}
        multiple
        // @ts-expect-error webkitdirectory is standard for folder picker
        webkitdirectory=""
        directory=""
        className="hidden"
        onChange={(e) => onScanMusic(e.target.files)}
      />

      {/* Header with Ambient Glow */}
      <div className="relative">
        <div
          className="absolute -top-10 -left-10 w-44 h-44 rounded-full blur-[70px] opacity-25 pointer-events-none"
          style={{ backgroundColor: accentColorHex }}
        />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#191624] dark:text-white transition-colors">
                NIOR
              </h1>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${accentColorHex}18`,
                  color: accentColorHex,
                  borderColor: `${accentColorHex}40`
                }}
              >
                Offline Engine
              </span>
            </div>
            <p className="text-xs text-[#777386] dark:text-white/50 mt-0.5 transition-colors">
              Liquid Glass Audio Engine
            </p>
          </div>

          {/* Quick Rescan Audio Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Scan Device Music"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/[0.04] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 border border-black/[0.08] dark:border-white/15 text-xs font-medium text-[#191624] dark:text-white transition-all active:scale-95"
          >
            <RefreshCw size={13} style={{ color: accentColorHex }} />
            <span>Scan Music</span>
          </button>
        </div>
      </div>

      {/* Quick Access Glass Cards (All Songs & My Playlists) */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* All Songs Card */}
        <div
          onClick={onNavigateToSongs}
          role="button"
          tabIndex={0}
          className="group relative p-4 rounded-3xl bg-white/80 dark:bg-[#1B1728]/80 backdrop-blur-2xl
                     border border-black/[0.08] dark:border-white/10 hover:border-black/20 dark:hover:border-white/20
                     transition-all duration-200 shadow-sm dark:shadow-lg cursor-pointer active:scale-[0.98] overflow-hidden"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3 border border-black/[0.06] dark:border-white/15 shadow-inner"
            style={{ backgroundColor: `${accentColorHex}20`, color: accentColorHex }}
          >
            <Music2 size={20} />
          </div>

          <h3 className="text-base font-bold text-[#191624] dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            All Songs
          </h3>
          <p className="text-xs text-[#777386] dark:text-white/50 mt-0.5 transition-colors">
            {songs.length} audio tracks
          </p>
        </div>

        {/* My Playlists Card */}
        <div
          onClick={onNavigateToPlaylists}
          role="button"
          tabIndex={0}
          className="group relative p-4 rounded-3xl bg-white/80 dark:bg-[#1B1728]/80 backdrop-blur-2xl
                     border border-black/[0.08] dark:border-white/10 hover:border-black/20 dark:hover:border-white/20
                     transition-all duration-200 shadow-sm dark:shadow-lg cursor-pointer active:scale-[0.98] overflow-hidden"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3 border border-black/[0.06] dark:border-white/15 shadow-inner"
            style={{ backgroundColor: `${accentColorHex}20`, color: accentColorHex }}
          >
            <ListMusic size={20} />
          </div>

          <h3 className="text-base font-bold text-[#191624] dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            My Playlists
          </h3>
          <p className="text-xs text-[#777386] dark:text-white/50 mt-0.5 transition-colors">
            {playlists.length} playlists
          </p>
        </div>
      </div>

      {/* Empty State Banner if 0 Songs */}
      {songs.length === 0 && (
        <div className="p-8 rounded-3xl bg-white/70 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-center space-y-4 shadow-sm dark:shadow-none transition-colors">
          <div
            className="w-14 h-14 mx-auto rounded-3xl flex items-center justify-center border border-black/[0.06] dark:border-white/15"
            style={{ backgroundColor: `${accentColorHex}20`, color: accentColorHex }}
          >
            <FolderOpen size={28} />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#191624] dark:text-white">No Music Found</h4>
            <p className="text-xs text-[#777386] dark:text-white/50 mt-1 max-w-xs mx-auto">
              Your music library is waiting for your songs.
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-white shadow-md transition-transform active:scale-95"
              style={{ backgroundColor: accentColorHex }}
            >
              Scan Music
            </button>
            <button
              onClick={() => folderInputRef.current?.click()}
              className="px-4 py-2.5 rounded-2xl text-xs font-medium bg-black/[0.04] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 border border-black/[0.08] dark:border-white/15 text-[#191624] dark:text-white transition-transform active:scale-95"
            >
              Scan Folder
            </button>
          </div>
        </div>
      )}

      {/* Recently Played Section */}
      {recentlyPlayed.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#191624] dark:text-white tracking-tight">Recently Played</h2>
            <span className="text-xs text-[#777386] dark:text-white/50">{recentlyPlayed.length} tracks</span>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1">
            {recentlyPlayed.slice(0, 10).map((song) => (
              <div
                key={song.id}
                onClick={() => onPlaySong(song, recentlyPlayed)}
                role="button"
                tabIndex={0}
                className="group w-32 shrink-0 p-2.5 rounded-3xl bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10
                           border border-black/[0.06] dark:border-white/10 hover:border-black/15 dark:hover:border-white/20
                           transition-all cursor-pointer active:scale-[0.97] shadow-sm dark:shadow-none"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-2.5 bg-purple-500/10 dark:bg-purple-950/40 border border-black/[0.06] dark:border-white/10">
                  {song.albumArt ? (
                    <img
                      src={song.albumArt}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-500 dark:text-purple-400">
                      <Music2 size={24} />
                    </div>
                  )}
                  <div
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: accentColorHex }}
                    >
                      <Play size={14} fill="white" className="text-white ml-0.5" />
                    </div>
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-[#191624] dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                  {song.title}
                </h4>
                <p className="text-[11px] text-[#777386] dark:text-white/50 truncate mt-0.5">
                  {song.artist}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frequently Played Tracks */}
      {frequentlyPlayed.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#191624] dark:text-white tracking-tight">Frequently Played</h2>
            <span className="text-xs text-[#777386] dark:text-white/50">Top Listens</span>
          </div>

          <div className="space-y-2">
            {frequentlyPlayed.slice(0, 5).map((song, idx) => (
              <div
                key={song.id}
                onClick={() => onPlaySong(song, frequentlyPlayed)}
                role="button"
                tabIndex={0}
                className="group p-3 rounded-2xl bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10
                           border border-black/[0.06] dark:border-white/10 hover:border-black/15 dark:hover:border-white/20
                           flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99]
                           shadow-sm dark:shadow-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-[#777386] dark:text-white/40 w-4 text-center">
                    {idx + 1}
                  </span>

                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-purple-500/10 dark:bg-purple-950/40 border border-black/[0.06] dark:border-white/15">
                    {song.albumArt ? (
                      <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-purple-500 dark:text-purple-400">
                        <Music2 size={18} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-[#191624] dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                      {song.title}
                    </h4>
                    <p className="text-xs text-[#777386] dark:text-white/50 truncate">
                      {song.artist} • {formatDuration(song.duration)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onToggleFavorite(song)}
                    aria-label="Toggle favorite"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#777386] dark:text-white/40 hover:text-red-500 transition-colors"
                  >
                    <Heart
                      size={18}
                      className={song.isFavorite ? 'fill-current' : ''}
                      style={{ color: song.isFavorite ? accentColorHex : undefined }}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
