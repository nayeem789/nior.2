import React from 'react';
import { Play, Pause, SkipForward, Disc } from 'lucide-react';
import { Song } from '../types/music';

interface Props {
  currentSong: Song;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
  onClick: () => void;
  accentColorHex: string;
}

export const MiniPlayer: React.FC<Props> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onClick,
  accentColorHex
}) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full flex justify-center px-4 mb-2 pointer-events-auto">
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label="Open full screen player"
        className="group relative w-full max-w-md h-16 rounded-[22px] px-3.5 flex items-center justify-between
                   bg-white/90 dark:bg-[#1B1728]/90
                   backdrop-blur-2xl border border-black/[0.08] dark:border-white/15
                   shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)]
                   cursor-pointer overflow-hidden z-20 transition-all duration-200 active:scale-[0.99]"
      >
        {/* Subtle Ambient Back-Glow */}
        <div
          className="absolute -left-10 top-0 w-28 h-full blur-2xl opacity-20 pointer-events-none"
          style={{ backgroundColor: accentColorHex }}
        />

        {/* Left: Album Artwork + Title & Artist */}
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-black/10 dark:border-white/20 bg-purple-500/10 dark:bg-purple-950/40 flex items-center justify-center shadow-sm">
            {currentSong.albumArt ? (
              <img
                src={currentSong.albumArt}
                alt={currentSong.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
              />
            ) : (
              <Disc className="w-6 h-6 text-purple-500 dark:text-purple-400" />
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-[#191624] dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
              {currentSong.title}
            </h4>
            <p className="text-xs text-[#777386] dark:text-white/60 truncate">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onPlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 focus:outline-none shadow-sm"
            style={{
              backgroundColor: `${accentColorHex}25`,
              color: accentColorHex
            }}
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            aria-label="Next song"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#777386] hover:text-[#191624] dark:text-white/70 dark:hover:text-white transition-colors focus:outline-none"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Bottom Hairline Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black/[0.06] dark:bg-white/10">
          <div
            className="h-full transition-all duration-300 ease-linear rounded-r-full"
            style={{
              width: `${Math.min(100, Math.max(0, progressPercent))}%`,
              backgroundColor: accentColorHex
            }}
          />
        </div>
      </div>
    </div>
  );
};
