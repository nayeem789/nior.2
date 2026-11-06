import React, { useState, useMemo } from 'react';
import { Search, X, Music2, Heart } from 'lucide-react';
import { Song } from '../types/music';

interface Props {
  songs: Song[];
  onPlaySong: (song: Song, queue: Song[]) => void;
  onToggleFavorite: (song: Song) => void;
  accentColorHex: string;
}

export const SearchScreen: React.FC<Props> = ({
  songs,
  onPlaySong,
  onToggleFavorite,
  accentColorHex
}) => {
  const [query, setQuery] = useState('');

  const filteredSongs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q) ||
        song.album.toLowerCase().includes(q)
    );
  }, [songs, query]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-8 pb-32 space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight text-[#191624] dark:text-white transition-colors">
        Search Music
      </h1>

      {/* Search Input Field */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777386] dark:text-white/40 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search songs, artists, albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-black/[0.04] dark:bg-[#1B1728]/80 border border-black/[0.08] dark:border-white/10
                     text-sm text-[#191624] dark:text-white placeholder-[#777386] dark:placeholder-white/40
                     focus:outline-none focus:border-black/20 dark:focus:border-white/25
                     shadow-inner transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center bg-black/10 dark:bg-white/10 text-[#777386] dark:text-white/60 hover:text-[#191624] dark:hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results / Empty States */}
      {!query.trim() ? (
        <div className="p-8 rounded-3xl bg-white/70 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-center space-y-3 shadow-sm dark:shadow-none transition-colors">
          <div
            className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center border border-black/[0.06] dark:border-white/10"
            style={{ backgroundColor: `${accentColorHex}20`, color: accentColorHex }}
          >
            <Search size={22} />
          </div>
          <h3 className="text-sm font-bold text-[#191624] dark:text-white">Instant Offline Search</h3>
          <p className="text-xs text-[#777386] dark:text-white/50 max-w-xs mx-auto">
            Zero network requests. Query your offline audio database across titles, artists, and albums in milliseconds.
          </p>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white/70 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-center space-y-2 shadow-sm dark:shadow-none transition-colors">
          <p className="text-sm font-semibold text-[#191624] dark:text-white">No tracks match "{query}"</p>
          <p className="text-xs text-[#777386] dark:text-white/50">Try searching with a different spelling or keyword.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-[#777386] dark:text-white/50">Found {filteredSongs.length} tracks</span>
          </div>

          {filteredSongs.map((song) => (
            <div
              key={song.id}
              onClick={() => onPlaySong(song, filteredSongs)}
              className="group p-3 rounded-2xl bg-white/70 dark:bg-[#1B1728]/70 border border-black/[0.06] dark:border-white/10
                         flex items-center justify-between gap-3 cursor-pointer hover:border-black/15 dark:hover:border-white/20
                         transition-all active:scale-[0.99] shadow-sm dark:shadow-none"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-purple-500/10 dark:bg-purple-950/40 border border-black/[0.06] dark:border-white/10">
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

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(song);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#777386] dark:text-white/40 hover:text-red-500"
              >
                <Heart
                  size={18}
                  className={song.isFavorite ? 'fill-current' : ''}
                  style={{ color: song.isFavorite ? accentColorHex : undefined }}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
