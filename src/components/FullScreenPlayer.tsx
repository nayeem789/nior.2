import React, { useState } from 'react';
import {
  ChevronDown,
  Heart,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  SlidersVertical,
  ListPlus,
  ListOrdered,
  Disc,
  X
} from 'lucide-react';
import { Song, RepeatMode } from '../types/music';

interface Props {
  currentSong: Song;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Song[];
  onClose: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onToggleFavorite: (song: Song) => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onOpenEqualizer: () => void;
  onOpenAddToPlaylist: () => void;
  onSelectQueueSong: (song: Song) => void;
  accentColorHex: string;
}

export const FullScreenPlayer: React.FC<Props> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  isShuffle,
  repeatMode,
  queue,
  onClose,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onToggleFavorite,
  onToggleShuffle,
  onCycleRepeat,
  onOpenEqualizer,
  onOpenAddToPlaylist,
  onSelectQueueSong,
  accentColorHex
}) => {
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [draggingTime, setDraggingTime] = useState<number | null>(null);

  const displayTime = draggingTime !== null ? draggingTime : currentTime;
  const safeDuration = duration > 0 ? duration : 180;
  const progressPercent = (displayTime / safeDuration) * 100;

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F5F4F9] dark:bg-[#0D0B14] text-[#191624] dark:text-white overflow-hidden select-none transition-colors">
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full blur-[100px] opacity-30 dark:opacity-40 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: accentColorHex }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/90 to-[#F5F4F9] dark:from-[#0D0B14]/80 dark:via-[#0D0B14]/95 dark:to-[#12101B] pointer-events-none" />

      {/* Main Player Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-between max-w-md w-full mx-auto px-6 pt-10 pb-8">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            aria-label="Collapse player"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/5 hover:bg-black/[0.08] dark:hover:bg-white/10 border border-black/[0.06] dark:border-white/10 transition-colors focus:outline-none"
          >
            <ChevronDown size={24} className="text-[#191624]/80 dark:text-white/80" />
          </button>

          <div className="text-center">
            <span
              className="text-[11px] font-bold tracking-widest uppercase"
              style={{ color: accentColorHex }}
            >
              Now Playing
            </span>
            <p className="text-xs text-[#777386] dark:text-white/50 truncate max-w-[180px]">
              {currentSong.album}
            </p>
          </div>

          <button
            onClick={onOpenEqualizer}
            aria-label="Equalizer"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/5 hover:bg-black/[0.08] dark:hover:bg-white/10 border border-black/[0.06] dark:border-white/10 transition-colors focus:outline-none"
            style={{ color: accentColorHex }}
          >
            <SlidersVertical size={20} />
          </button>
        </div>

        {/* Square Album Artwork with Glass Border & Ambient Glow */}
        <div className="my-auto flex justify-center py-4">
          <div
            className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-[32px] overflow-hidden p-1
                       bg-white/80 dark:bg-white/10 backdrop-blur-md border border-black/[0.08] dark:border-white/20
                       shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] group"
          >
            <div className="w-full h-full rounded-[28px] overflow-hidden bg-purple-500/10 dark:bg-purple-950/40 relative flex items-center justify-center">
              {currentSong.albumArt ? (
                <img
                  src={currentSong.albumArt}
                  alt={currentSong.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform duration-1000 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                />
              ) : (
                <Disc className="w-24 h-24 text-purple-400/60" />
              )}
            </div>
          </div>
        </div>

        {/* Track Metadata & Favorite Button */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#191624] dark:text-white truncate">
                {currentSong.title}
              </h2>
              <p className="text-sm font-medium text-[#777386] dark:text-white/60 truncate mt-0.5">
                {currentSong.artist}
              </p>
            </div>

            <button
              onClick={() => onToggleFavorite(currentSong)}
              aria-label={currentSong.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/5 hover:bg-black/[0.08] dark:hover:bg-white/10 border border-black/[0.06] dark:border-white/10 transition-colors focus:outline-none shrink-0"
            >
              <Heart
                size={22}
                className={currentSong.isFavorite ? 'fill-current' : ''}
                style={{
                  color: currentSong.isFavorite ? accentColorHex : 'rgba(120, 120, 120, 0.4)'
                }}
              />
            </button>
          </div>

          {/* Timeline Seekbar */}
          <div className="mb-6">
            <div className="relative group flex items-center">
              <input
                type="range"
                min={0}
                max={safeDuration}
                step={0.5}
                value={displayTime}
                onChange={(e) => setDraggingTime(parseFloat(e.target.value))}
                onMouseUp={() => {
                  if (draggingTime !== null) {
                    onSeek(draggingTime);
                    setDraggingTime(null);
                  }
                }}
                onTouchEnd={() => {
                  if (draggingTime !== null) {
                    onSeek(draggingTime);
                    setDraggingTime(null);
                  }
                }}
                className="w-full h-1.5 rounded-full appearance-none bg-black/10 dark:bg-white/15 cursor-pointer accent-purple-500 focus:outline-none"
                style={{
                  background: `linear-gradient(to right, ${accentColorHex} 0%, ${accentColorHex} ${progressPercent}%, rgba(120,120,120,0.2) ${progressPercent}%, rgba(120,120,120,0.2) 100%)`
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-[#777386] dark:text-white/50 font-mono tabular-nums mt-2">
              <span>{formatTime(displayTime)}</span>
              <span>{formatTime(safeDuration)}</span>
            </div>
          </div>

          {/* Main Controls Row */}
          <div className="flex items-center justify-between mb-6">
            {/* Shuffle */}
            <button
              onClick={onToggleShuffle}
              aria-label="Toggle shuffle"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none"
              style={{
                color: isShuffle ? accentColorHex : undefined
              }}
            >
              <Shuffle size={20} className={isShuffle ? '' : 'text-[#777386] dark:text-white/40'} />
            </button>

            {/* Previous */}
            <button
              onClick={onPrevious}
              aria-label="Previous song"
              className="w-12 h-12 rounded-full flex items-center justify-center text-[#191624]/80 dark:text-white/80 hover:text-[#191624] dark:hover:text-white transition-transform active:scale-95 focus:outline-none"
            >
              <SkipBack size={28} />
            </button>

            {/* Play/Pause Orb */}
            <button
              onClick={onPlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-18 h-18 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 focus:outline-none"
              style={{
                backgroundColor: accentColorHex,
                boxShadow: `0 0 32px 0px ${accentColorHex}60`
              }}
            >
              {isPlaying ? (
                <Pause size={30} fill="white" className="text-white" />
              ) : (
                <Play size={30} fill="white" className="text-white ml-1" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={onNext}
              aria-label="Next song"
              className="w-12 h-12 rounded-full flex items-center justify-center text-[#191624]/80 dark:text-white/80 hover:text-[#191624] dark:hover:text-white transition-transform active:scale-95 focus:outline-none"
            >
              <SkipForward size={28} />
            </button>

            {/* Repeat Mode */}
            <button
              onClick={onCycleRepeat}
              aria-label="Cycle repeat mode"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none"
              style={{
                color: repeatMode !== 'off' ? accentColorHex : undefined
              }}
            >
              {repeatMode === 'one' ? (
                <Repeat1 size={20} />
              ) : (
                <Repeat size={20} className={repeatMode !== 'off' ? '' : 'text-[#777386] dark:text-white/40'} />
              )}
            </button>
          </div>

          {/* Secondary Action Strip (Add to playlist & Queue) */}
          <div className="flex items-center justify-around pt-3 border-t border-black/[0.08] dark:border-white/10">
            <button
              onClick={onOpenAddToPlaylist}
              className="flex items-center gap-2 text-xs font-medium text-[#777386] hover:text-[#191624] dark:text-white/70 dark:hover:text-white transition-colors"
            >
              <ListPlus size={16} />
              <span>Add to Playlist</span>
            </button>

            <button
              onClick={() => setIsQueueOpen(true)}
              className="flex items-center gap-2 text-xs font-medium text-[#777386] hover:text-[#191624] dark:text-white/70 dark:hover:text-white transition-colors"
            >
              <ListOrdered size={16} />
              <span>Queue ({queue.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Queue Drawer Modal */}
      {isQueueOpen && (
        <div className="fixed inset-0 z-60 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md mx-auto max-h-[75vh] flex flex-col rounded-t-[32px] bg-white dark:bg-[#161224] border-t border-black/[0.08] dark:border-white/15 p-6 shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/10">
              <h3 className="text-base font-bold text-[#191624] dark:text-white flex items-center gap-2">
                <ListOrdered size={18} style={{ color: accentColorHex }} />
                <span>Playing Queue ({queue.length})</span>
              </h3>
              <button
                onClick={() => setIsQueueOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.1] dark:hover:bg-white/20 text-[#777386] dark:text-white/70 focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar py-3 space-y-2 flex-1">
              {queue.map((song, idx) => {
                const isCurrent = song.id === currentSong.id;
                return (
                  <div
                    key={song.id + idx}
                    onClick={() => {
                      onSelectQueueSong(song);
                      setIsQueueOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${
                      isCurrent
                        ? 'bg-purple-500/10 dark:bg-purple-900/40 border border-purple-500/30'
                        : 'hover:bg-black/[0.03] dark:hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-purple-500/10 dark:bg-purple-950/40">
                      {song.albumArt ? (
                        <img
                          src={song.albumArt}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Disc className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-purple-600 dark:text-purple-300' : 'text-[#191624] dark:text-white'
                        }`}
                      >
                        {song.title}
                      </p>
                      <p className="text-xs text-[#777386] dark:text-white/50 truncate">{song.artist}</p>
                    </div>
                    {isCurrent && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${accentColorHex}25`,
                          color: accentColorHex
                        }}
                      >
                        Playing
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
