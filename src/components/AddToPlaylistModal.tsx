import React, { useState } from 'react';
import { X, Plus, Check, ListMusic } from 'lucide-react';
import { Playlist, Song } from '../types/music';

interface Props {
  song: Song;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, songId: string) => void;
  onCreatePlaylist: (name: string, songIdToAdd?: string) => void;
  onClose: () => void;
  accentColorHex: string;
}

export const AddToPlaylistModal: React.FC<Props> = ({
  song,
  playlists,
  onAddToPlaylist,
  onCreatePlaylist,
  onClose,
  accentColorHex
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName.trim(), song.id);
      setNewPlaylistName('');
      setIsCreating(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-sm rounded-[32px] p-6 text-[#191624] dark:text-white
                   bg-white dark:bg-[#161224] backdrop-blur-2xl
                   border border-black/[0.08] dark:border-white/15 shadow-2xl
                   flex flex-col gap-4 max-h-[85vh] overflow-hidden transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ListMusic size={20} style={{ color: accentColorHex }} />
            <h3 className="text-base font-bold">Add to Playlist</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/5 hover:bg-black/[0.08] dark:hover:bg-white/10 text-[#777386] dark:text-white/60 hover:text-[#191624] dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[#777386] dark:text-white/60 truncate">
          Select target playlist for <strong className="text-[#191624] dark:text-white">"{song.title}"</strong>:
        </p>

        {/* Existing Playlists List */}
        <div className="overflow-y-auto no-scrollbar space-y-2 max-h-56 pr-1">
          {playlists.map((playlist) => {
            const alreadyIn = playlist.songIds.includes(song.id);
            return (
              <div
                key={playlist.id}
                onClick={() => {
                  if (!alreadyIn) {
                    onAddToPlaylist(playlist.id, song.id);
                    onClose();
                  }
                }}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-colors ${
                  alreadyIn
                    ? 'bg-purple-500/10 dark:bg-purple-950/20 border-purple-500/30 opacity-75'
                    : 'bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border-black/[0.06] dark:border-white/10'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-sm font-semibold truncate text-[#191624] dark:text-white">{playlist.name}</h4>
                  <p className="text-xs text-[#777386] dark:text-white/50">{playlist.songIds.length} tracks</p>
                </div>
                {alreadyIn ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-purple-600 dark:text-purple-400">
                    <Check size={14} /> Added
                  </span>
                ) : (
                  <Plus size={16} className="text-[#777386] dark:text-white/40" />
                )}
              </div>
            );
          })}
        </div>

        {/* Inline Create New Playlist Section */}
        {isCreating ? (
          <form onSubmit={handleCreate} className="pt-2 border-t border-black/[0.06] dark:border-white/10">
            <input
              type="text"
              autoFocus
              placeholder="New Playlist Name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/10 border border-black/[0.08] dark:border-white/20 text-sm text-[#191624] dark:text-white placeholder-[#777386] dark:placeholder-white/40 focus:outline-none mb-2"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-opacity disabled:opacity-40"
                style={{ backgroundColor: accentColorHex }}
              >
                Create & Add
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-black/[0.05] dark:bg-white/10 text-[#777386] dark:text-white/70 hover:bg-black/[0.08] dark:hover:bg-white/15"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2.5 rounded-xl border border-dashed border-black/[0.15] dark:border-white/20 flex items-center justify-center gap-2 text-xs font-medium text-[#777386] dark:text-white/70 hover:text-[#191624] dark:hover:text-white transition-colors"
          >
            <Plus size={16} />
            <span>Create New Playlist</span>
          </button>
        )}
      </div>
    </div>
  );
};
