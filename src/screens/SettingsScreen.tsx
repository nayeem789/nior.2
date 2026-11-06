import React, { useRef } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Palette,
  RefreshCw,
  Sliders,
  Check,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { ThemeMode, AccentColor, Playlist, Song } from '../types/music';

interface Props {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  highQuality: boolean;
  rememberLastPlayed: boolean;
  songs: Song[];
  playlists: Playlist[];
  onThemeModeChange: (mode: ThemeMode) => void;
  onAccentColorChange: (color: AccentColor) => void;
  onToggleHighQuality: () => void;
  onToggleRememberLastPlayed: () => void;
  onOpenEqualizer: () => void;
  onScanMusic: (files: FileList | null) => void;
  accentColorHex: string;
}

const ACCENT_COLORS: { id: AccentColor; label: string; hex: string }[] = [
  { id: 'purple', label: 'Purple', hex: '#8B5CF6' },
  { id: 'blue', label: 'Blue', hex: '#3B82F6' },
  { id: 'cyan', label: 'Cyan', hex: '#06B6D4' },
  { id: 'emerald', label: 'Emerald', hex: '#10B981' },
  { id: 'rose', label: 'Rose', hex: '#F43F5E' },
  { id: 'amber', label: 'Amber', hex: '#F59E0B' },
];

const THEME_OPTIONS = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'system', label: 'System', icon: Laptop },
] as const;

export const SettingsScreen: React.FC<Props> = ({
  themeMode,
  accentColor,
  highQuality,
  rememberLastPlayed,
  songs,
  playlists,
  onThemeModeChange,
  onAccentColorChange,
  onToggleHighQuality,
  onToggleRememberLastPlayed,
  onOpenEqualizer,
  onScanMusic,
  accentColorHex
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-8 pb-32 space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="audio/*,.mp3,.flac,.wav,.m4a,.aac,.ogg,.opus"
        className="hidden"
        onChange={(e) => onScanMusic(e.target.files)}
      />

      <h1 className="text-2xl font-extrabold tracking-tight text-[#191624] dark:text-white transition-colors">
        Settings
      </h1>

      {/* Appearance Section */}
      <div className="p-5 rounded-3xl bg-white/80 dark:bg-[#1B1728]/80 backdrop-blur-2xl border border-black/[0.08] dark:border-white/10 shadow-sm dark:shadow-lg space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-[#191624] dark:text-white flex items-center gap-2">
          <Palette size={16} style={{ color: accentColorHex }} />
          <span>Appearance</span>
        </h3>

        {/* Real Animated Sliding Pill Theme Selector */}
        <div className="relative w-full h-11 p-1 rounded-2xl bg-black/[0.04] dark:bg-white/5 border border-black/[0.06] dark:border-white/10 flex items-center justify-between">
          {THEME_OPTIONS.map((item) => {
            const isSelected = themeMode === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onThemeModeChange(item.id)}
                className="relative flex-1 h-full rounded-xl flex items-center justify-center gap-1.5 z-10 transition-colors focus:outline-none"
              >
                {/* Genuine Spring Animated Sliding Pill */}
                {isSelected && (
                  <motion.div
                    layoutId="themeSlidingPill"
                    className="absolute inset-0 rounded-xl bg-white dark:bg-white/15 border border-purple-500/30 dark:border-white/20 shadow-sm"
                    style={{
                      boxShadow: `0 2px 10px -2px ${accentColorHex}30`
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 32
                    }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon
                    size={14}
                    style={{
                      color: isSelected ? accentColorHex : undefined
                    }}
                    className={isSelected ? '' : 'text-[#777386] dark:text-white/50'}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      isSelected
                        ? 'text-[#191624] dark:text-white'
                        : 'text-[#777386] dark:text-white/50'
                    }`}
                    style={{
                      color: isSelected ? accentColorHex : undefined
                    }}
                  >
                    {item.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Accent Colors Palette */}
        <div>
          <span className="text-xs font-medium text-[#777386] dark:text-white/60 mb-2.5 block">
            Accent Color
          </span>
          <div className="flex items-center justify-between px-1">
            {ACCENT_COLORS.map((item) => {
              const isSelected = accentColor === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onAccentColorChange(item.id)}
                  title={item.label}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 relative"
                  style={{ backgroundColor: item.hex }}
                >
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow">
                      <Check size={12} className="text-black stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Library Management Section */}
      <div className="p-5 rounded-3xl bg-white/80 dark:bg-[#1B1728]/80 backdrop-blur-2xl border border-black/[0.08] dark:border-white/10 shadow-sm dark:shadow-lg space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-[#191624] dark:text-white flex items-center gap-2">
          <RefreshCw size={16} style={{ color: accentColorHex }} />
          <span>Library Management</span>
        </h3>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-black/[0.06] dark:border-white/10 flex items-center justify-between text-left transition-colors"
        >
          <div>
            <h4 className="text-sm font-semibold text-[#191624] dark:text-white">Rescan Audio Library</h4>
            <p className="text-xs text-[#777386] dark:text-white/50">Scan device storage & import new audio files</p>
          </div>
          <RefreshCw size={16} className="text-[#777386] dark:text-white/40" />
        </button>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/[0.06] dark:border-white/10 text-center">
            <span className="text-xl font-bold font-mono text-[#191624] dark:text-white">{songs.length}</span>
            <span className="text-xs text-[#777386] dark:text-white/50 block mt-0.5">Scanned Songs</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/[0.06] dark:border-white/10 text-center">
            <span className="text-xl font-bold font-mono text-[#191624] dark:text-white">{playlists.length}</span>
            <span className="text-xs text-[#777386] dark:text-white/50 block mt-0.5">Saved Playlists</span>
          </div>
        </div>
      </div>

      {/* Audio Engine & Equalizer */}
      <div className="p-5 rounded-3xl bg-white/80 dark:bg-[#1B1728]/80 backdrop-blur-2xl border border-black/[0.08] dark:border-white/10 shadow-sm dark:shadow-lg space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-[#191624] dark:text-white flex items-center gap-2">
          <Sliders size={16} style={{ color: accentColorHex }} />
          <span>Audio Engine & Effects</span>
        </h3>

        <button
          onClick={onOpenEqualizer}
          className="w-full p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-black/[0.06] dark:border-white/10 flex items-center justify-between text-left transition-colors"
        >
          <div>
            <h4 className="text-sm font-semibold text-[#191624] dark:text-white">5-Band Audio Equalizer</h4>
            <p className="text-xs text-[#777386] dark:text-white/50">Parametric EQ, presets & dynamic bass boost</p>
          </div>
          <Sliders size={18} style={{ color: accentColorHex }} />
        </button>

        {/* High Quality Mode Switch */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h4 className="text-sm font-semibold text-[#191624] dark:text-white">Lossless High-Fidelity Audio</h4>
            <p className="text-xs text-[#777386] dark:text-white/50">Native 24-bit / 96kHz playback decoding</p>
          </div>
          <button
            onClick={onToggleHighQuality}
            className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
              highQuality ? 'justify-end' : 'justify-start bg-black/20 dark:bg-white/20'
            }`}
            style={{ backgroundColor: highQuality ? accentColorHex : undefined }}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Remember Last Played */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h4 className="text-sm font-semibold text-[#191624] dark:text-white">Remember Last Played Track</h4>
            <p className="text-xs text-[#777386] dark:text-white/50">Restore active queue when restarting app</p>
          </div>
          <button
            onClick={onToggleRememberLastPlayed}
            className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
              rememberLastPlayed ? 'justify-end' : 'justify-start bg-black/20 dark:bg-white/20'
            }`}
            style={{ backgroundColor: rememberLastPlayed ? accentColorHex : undefined }}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* About & Offline Privacy Guarantee */}
      <div className="p-5 rounded-3xl bg-white/80 dark:bg-[#1B1728]/80 backdrop-blur-2xl border border-black/[0.08] dark:border-white/10 shadow-sm dark:shadow-lg space-y-3 transition-colors">
        <div className="flex items-center gap-2 text-[#191624] dark:text-white">
          <ShieldCheck size={18} className="text-emerald-500" />
          <h3 className="text-sm font-bold">100% Offline Privacy Guarantee</h3>
        </div>
        <p className="text-xs text-[#777386] dark:text-white/60 leading-relaxed">
          NIOR is engineered with zero internet dependencies. No cloud servers, no account logins, no telemetry, and no ad trackers. Your music library remains exclusively on your device.
        </p>
        <div className="pt-2 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between text-[11px] text-[#777386] dark:text-white/40">
          <span>NIOR Music Player • v1.0.0</span>
          <span>Local Storage Only</span>
        </div>
      </div>
    </div>
  );
};
