import React, { useState, useMemo } from 'react';
import { ArrowLeft, ArrowUpDown, Heart, Music2, MoreVertical, Disc, User, FolderOpen } from 'lucide-react';
import { Song, SortOption } from '../types/music';

interface Props {
  songs: Song[];
  onPlaySong: (song: Song, queue: Song[]) => void;
  onToggleFavorite: (song: Song) => void;
  onOpenAddToPlaylist: (song: Song) => void;
  accentColorHex: string;
}

export const MusicLibraryScreen: React.FC<Props> = ({
  songs,
  onPlaySong,
  onToggleFavorite,
  onOpenAddToPlaylist,
  accentColorHex
}) => {
  const [activeCategory, setActiveCategory] = useState<'songs' | 'artists' | 'albums'>('songs');
  const [sortOption, setSortOption] = useState<SortOption>('title');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  // Drilldown states for Artist or Album
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  // Sorted songs
  const sortedSongs = useMemo(() => {
    const list = [...songs];
    switch (sortOption) {
      case 'artist':
        return list.sort((a, b) => a.artist.localeCompare(b.artist));
      case 'album':
        return list.sort((a, b) => a.album.localeCompare(b.album));
      case 'duration':
        return list.sort((a, b) => b.duration - a.duration);
      case 'date':
        return list.sort((a, b) => b.dateAdded - a.dateAdded);
      case 'title':
      default:
        return list.sort((a, b) => a.title.localeCompare(b.title));
    }
  }, [songs, sortOption]);

  // Groupings
  const artistsMap = useMemo(() => {
    const map = new Map<string, Song[]>();
    songs.forEach((song) => {
      const arr = map.get(song.artist) || [];
      arr.push(song);
      map.set(song.artist, arr);
    });
    return map;
  }, [songs]);

  const albumsMap = useMemo(() => {
    const map = new Map<string, Song[]>();
    songs.forEach((song) => {
      const arr = map.get(song.album) || [];
      arr.push(song);
      map.set(song.album, arr);
    });
    return map;
  }, [songs]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-8 pb-32 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#191624] dark:text-white transition-colors">
          Music Library
        </h1>

        {/* Sort Menu Button */}
        {songs.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/[0.04] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 border border-black/[0.08] dark:border-white/10 text-xs font-medium text-[#191624] dark:text-white transition-colors"
            >
              <ArrowUpDown size={14} style={{ color: accentColorHex }} />
              <span className="capitalize">{sortOption}</span>
            </button>

            {isSortMenuOpen && (
              <div className="absolute right-0 top-10 z-40 w-44 rounded-2xl bg-white dark:bg-[#1B1728] border border-black/[0.08] dark:border-white/15 p-1.5 shadow-2xl">
                {(['title', 'artist', 'album', 'duration', 'date'] as SortOption[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortOption(opt);
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs capitalize transition-colors ${
                      sortOption === opt
                        ? 'bg-purple-500/10 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 font-semibold'
                        : 'text-[#191624]/70 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/5'
                    }`}
                  >
                    Sort by {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {songs.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white/70 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-center space-y-3 transition-colors">
          <div
            className="w-14 h-14 mx-auto rounded-3xl flex items-center justify-center border border-black/[0.06] dark:border-white/15"
            style={{ backgroundColor: `${accentColorHex}20`, color: accentColorHex }}
          >
            <FolderOpen size={28} />
          </div>
          <h4 className="text-base font-bold text-[#191624] dark:text-white">No Music Found</h4>
          <p className="text-xs text-[#777386] dark:text-white/50 max-w-xs mx-auto">
            Your music library is waiting for your songs.
          </p>
        </div>
      ) : (
        <>
          {/* Segmented Category Pill Tabs */}
          <div className="p-1 rounded-2xl bg-black/[0.04] dark:bg-[#1B1728]/80 border border-black/[0.06] dark:border-white/10 flex transition-colors">
            {(['songs', 'artists', 'albums'] as const).map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setSelectedArtist(null);
                    setSelectedAlbum(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-white/15 text-[#191624] dark:text-white shadow-sm'
                      : 'text-[#777386] dark:text-white/50 hover:text-[#191624] dark:hover:text-white/80'
                  }`}
                  style={{
                    color: isSelected ? accentColorHex : undefined
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Drill-down Back Bar if Artist or Album selected */}
          {(selectedArtist || selectedAlbum) && (
            <div className="flex items-center gap-2 pt-1 pb-1">
              <button
                onClick={() => {
                  setSelectedArtist(null);
                  setSelectedAlbum(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-xs text-[#191624] dark:text-white"
              >
                <ArrowLeft size={14} />
                <span>All {selectedArtist ? 'Artists' : 'Albums'}</span>
              </button>
              <span className="text-sm font-bold text-[#191624] dark:text-white truncate">
                {selectedArtist || selectedAlbum}
              </span>
            </div>
          )}

          {/* Content Rendering based on Category & Drill-down */}
          {activeCategory === 'songs' && (
            <div className="space-y-2">
              {sortedSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song, sortedSongs)}
                  role="button"
                  tabIndex={0}
                  className="group p-3 rounded-2xl bg-white/70 dark:bg-[#1B1728]/70 hover:bg-white dark:hover:bg-[#1B1728]
                             border border-black/[0.06] dark:border-white/10 hover:border-black/15 dark:hover:border-white/20
                             flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99]
                             shadow-sm dark:shadow-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-purple-500/10 dark:bg-purple-950/40 border border-black/[0.06] dark:border-white/10 relative">
                      {song.albumArt ? (
                        <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-500 dark:text-purple-400">
                          <Music2 size={20} />
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

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleFavorite(song)}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[#777386] dark:text-white/40 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        size={18}
                        className={song.isFavorite ? 'fill-current' : ''}
                        style={{ color: song.isFavorite ? accentColorHex : undefined }}
                      />
                    </button>

                    <button
                      onClick={() => onOpenAddToPlaylist(song)}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[#777386] dark:text-white/40 hover:text-[#191624] dark:hover:text-white transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Artists Category */}
          {activeCategory === 'artists' && (
            <>
              {selectedArtist ? (
                <div className="space-y-2">
                  {(artistsMap.get(selectedArtist) || []).map((song) => (
                    <div
                      key={song.id}
                      onClick={() => onPlaySong(song, artistsMap.get(selectedArtist) || [])}
                      className="group p-3 rounded-2xl bg-white/70 dark:bg-[#1B1728]/70 border border-black/[0.06] dark:border-white/10 flex items-center justify-between gap-3 cursor-pointer shadow-sm dark:shadow-none"
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
                          <h4 className="text-sm font-semibold text-[#191624] dark:text-white truncate">{song.title}</h4>
                          <p className="text-xs text-[#777386] dark:text-white/50 truncate">{song.album}</p>
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
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from(artistsMap.entries()).map(([artist, artistSongs]) => (
                    <div
                      key={artist}
                      onClick={() => setSelectedArtist(artist)}
                      className="p-4 rounded-3xl bg-white/80 dark:bg-[#1B1728]/80 border border-black/[0.08] dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 cursor-pointer flex flex-col items-center text-center transition-transform active:scale-[0.98] shadow-sm dark:shadow-none"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-3 border border-black/[0.06] dark:border-white/15"
                        style={{ backgroundColor: `${accentColorHex}20`, color: accentColorHex }}
                      >
                        <User size={28} />
                      </div>
                      <h4 className="text-sm font-bold text-[#191624] dark:text-white truncate w-full">{artist}</h4>
                      <p className="text-xs text-[#777386] dark:text-white/50 mt-0.5">{artistSongs.length} tracks</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Albums Category */}
          {activeCategory === 'albums' && (
            <>
              {selectedAlbum ? (
                <div className="space-y-2">
                  {(albumsMap.get(selectedAlbum) || []).map((song) => (
                    <div
                      key={song.id}
                      onClick={() => onPlaySong(song, albumsMap.get(selectedAlbum) || [])}
                      className="group p-3 rounded-2xl bg-white/70 dark:bg-[#1B1728]/70 border border-black/[0.06] dark:border-white/10 flex items-center justify-between gap-3 cursor-pointer shadow-sm dark:shadow-none"
                    >
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-[#191624] dark:text-white truncate">{song.title}</h4>
                        <p className="text-xs text-[#777386] dark:text-white/50 truncate">
                          {song.artist} • {formatDuration(song.duration)}
                        </p>
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
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  {Array.from(albumsMap.entries()).map(([album, albumSongs]) => {
                    const sampleSong = albumSongs[0];
                    return (
                      <div
                        key={album}
                        onClick={() => setSelectedAlbum(album)}
                        className="group p-3 rounded-3xl bg-white/80 dark:bg-[#1B1728]/80 border border-black/[0.08] dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 cursor-pointer transition-transform active:scale-[0.98] shadow-sm dark:shadow-none"
                      >
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-2.5 bg-purple-500/10 dark:bg-purple-950/40 border border-black/[0.06] dark:border-white/10">
                          {sampleSong?.albumArt ? (
                            <img
                              src={sampleSong.albumArt}
                              alt={album}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-purple-500 dark:text-purple-400">
                              <Disc size={32} />
                            </div>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-[#191624] dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                          {album}
                        </h4>
                        <p className="text-[11px] text-[#777386] dark:text-white/50 truncate mt-0.5">
                          {sampleSong?.artist || 'Unknown'} • {albumSongs.length} tracks
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
