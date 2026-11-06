import React, { useState } from 'react';
import { Plus, ListMusic, Play, Shuffle, Trash2, ArrowLeft, Music2, Heart } from 'lucide-react';
import { Playlist, Song } from '../types/music';

interface Props {
  playlists: Playlist[];
  songs: Song[];
  onPlaySong: (song: Song, queue: Song[]) => void;
  onShuffleQueue: (songs: Song[]) => void;
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (id: string) => void;
  onRemoveSongFromPlaylist: (playlistId: string, songId: string) => void;
  onToggleFavorite: (song: Song) => void;
  accentColorHex: string;
}

export const PlaylistScreen: React.FC<Props> = ({
  playlists,
  songs,
  onPlaySong,
  onShuffleQueue,
  onCreatePlaylist,
  onDeletePlaylist,
  onRemoveSongFromPlaylist,
  onToggleFavorite,
  accentColorHex
}) => {
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);
  const playlistSongs = activePlaylist
    ? activePlaylist.songIds
        .map((id) => songs.find((s) => s.id === id))
        .filter((s): s is Song => s != null)
    : [];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-8 pb-32 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#191624] dark:text-white transition-colors">
          {activePlaylist ? activePlaylist.name : 'Playlists'}
        </h1>

        {!activePlaylist ? (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-semibold text-white shadow-md transition-transform active:scale-95"
            style={{ backgroundColor: accentColorHex }}
          >
            <Plus size={16} />
            <span>New Playlist</span>
          </button>
        ) : (
          <button
            onClick={() => setActivePlaylistId(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/[0.04] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-xs text-[#191624] dark:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>All Playlists</span>
          </button>
        )}
      </div>

      {/* Main Playlists List (When No Playlist is opened) */}
      {!activePlaylist && (
        <>
          {playlists.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/70 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-center space-y-3 transition-colors shadow-sm dark:shadow-none">
              <div
                className="w-14 h-14 mx-auto rounded-3xl flex items-center justify-center border border-black/[0.06] dark:border-white/15"
                style={{ backgroundColor: `${accentColorHex}20`, color: accentColorHex }}
              >
                <ListMusic size={28} />
              </div>
              <h3 className="text-base font-bold text-[#191624] dark:text-white">No Playlists Created</h3>
              <p className="text-xs text-[#777386] dark:text-white/50 max-w-xs mx-auto">
                Organize your offline songs into custom high-fidelity music collections.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white shadow-md transition-transform active:scale-95"
                style={{ backgroundColor: accentColorHex }}
              >
                Create First Playlist
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {playlists.map((playlist) => {
                const count = playlist.songIds.length;
                return (
                  <div
                    key={playlist.id}
                    onClick={() => setActivePlaylistId(playlist.id)}
                    className="group p-4 rounded-3xl bg-white/80 dark:bg-[#1B1728]/80 border border-black/[0.08] dark:border-white/10
                               hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer flex items-center justify-between gap-3
                               shadow-sm dark:shadow-none"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-black/[0.06] dark:border-white/15"
                        style={{ backgroundColor: `${accentColorHex}20`, color: accentColorHex }}
                      >
                        <ListMusic size={22} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#191624] dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                          {playlist.name}
                        </h3>
                        <p className="text-xs text-[#777386] dark:text-white/50 mt-0.5">{count} tracks</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlaylist(playlist.id);
                      }}
                      title="Delete playlist"
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[#777386] dark:text-white/30 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Opened Playlist View */}
      {activePlaylist && (
        <div className="space-y-4">
          {/* Action Buttons: Play All & Shuffle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (playlistSongs.length > 0) {
                  onPlaySong(playlistSongs[0], playlistSongs);
                }
              }}
              disabled={playlistSongs.length === 0}
              className="flex-1 py-3 rounded-2xl font-semibold text-xs text-white flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: accentColorHex }}
            >
              <Play size={16} fill="white" />
              <span>Play All</span>
            </button>

            <button
              onClick={() => {
                if (playlistSongs.length > 0) {
                  onShuffleQueue(playlistSongs);
                }
              }}
              disabled={playlistSongs.length === 0}
              className="flex-1 py-3 rounded-2xl font-semibold text-xs text-[#191624] dark:text-white bg-black/[0.04] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 border border-black/[0.08] dark:border-white/10 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-40"
            >
              <Shuffle size={16} />
              <span>Shuffle</span>
            </button>
          </div>

          {/* Playlist Track List */}
          {playlistSongs.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/70 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-center space-y-2 shadow-sm dark:shadow-none">
              <p className="text-sm text-[#191624] dark:text-white/70">This playlist is empty.</p>
              <p className="text-xs text-[#777386] dark:text-white/40">
                Go to the Music Library to add songs to this playlist.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {playlistSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song, playlistSongs)}
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
                      <p className="text-xs text-[#777386] dark:text-white/50 truncate">
                        {song.artist} • {formatDuration(song.duration)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleFavorite(song)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#777386] dark:text-white/40 hover:text-red-500"
                    >
                      <Heart
                        size={17}
                        className={song.isFavorite ? 'fill-current' : ''}
                        style={{ color: song.isFavorite ? accentColorHex : undefined }}
                      />
                    </button>
                    <button
                      onClick={() => onRemoveSongFromPlaylist(activePlaylist.id, song.id)}
                      title="Remove from playlist"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#777386] dark:text-white/30 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-sm rounded-[32px] p-6 text-[#191624] dark:text-white bg-white dark:bg-[#161224] border border-black/[0.08] dark:border-white/15 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold">Create New Playlist</h3>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Night Drive, Workout Beats"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-black/[0.04] dark:bg-white/10 border border-black/[0.08] dark:border-white/20 text-sm text-[#191624] dark:text-white placeholder-[#777386] dark:placeholder-white/40 focus:outline-none"
            />
            <div className="flex gap-2.5">
              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="flex-1 py-3 rounded-2xl text-xs font-semibold text-white shadow-md disabled:opacity-40"
                style={{ backgroundColor: accentColorHex }}
              >
                Create Playlist
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-3 rounded-2xl text-xs font-medium bg-black/[0.05] dark:bg-white/10 text-[#777386] dark:text-white/70"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
