import React from 'react';
import { Home, Music2, ListMusic, Settings, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  selectedTab: number;
  onSelectTab: (index: number) => void;
  accentColorHex: string;
}

const TABS = [
  { id: 0, label: 'Home', icon: Home },
  { id: 1, label: 'Music', icon: Music2 },
  { id: 2, label: 'Playlist', icon: ListMusic },
  { id: 3, label: 'Settings', icon: Settings },
  { id: 4, label: 'Search', icon: Search },
];

export const LiquidGlassBottomNav: React.FC<Props> = ({ selectedTab, onSelectTab, accentColorHex }) => {
  return (
    <div className="w-full flex justify-center px-4 pointer-events-auto">
      <nav
        aria-label="Bottom Navigation"
        className="relative w-full max-w-md h-16 rounded-[28px] p-1.5 flex items-center justify-between
                   bg-white/85 dark:bg-[#1B1728]/85
                   backdrop-blur-2xl border border-black/[0.08] dark:border-white/15
                   shadow-[0_12px_40px_-10px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] z-30 transition-colors"
      >
        {TABS.map((tab) => {
          const isSelected = selectedTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="relative flex-1 h-full flex flex-col items-center justify-center rounded-[22px]
                         transition-colors duration-200 z-10 focus:outline-none"
            >
              {/* Animated Sliding Liquid Glass Selection Pill */}
              {isSelected && (
                <motion.div
                  layoutId="slidingNavPill"
                  className="absolute inset-0 rounded-[22px] border border-purple-500/30 dark:border-white/25 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${accentColorHex}30, ${accentColorHex}12)`,
                    borderColor: `${accentColorHex}60`,
                    boxShadow: `0 0 20px -3px ${accentColorHex}35`
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 32
                  }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <Icon
                  size={20}
                  className="transition-transform duration-200"
                  style={{
                    color: isSelected ? accentColorHex : undefined,
                    transform: isSelected ? 'scale(1.08)' : 'scale(1)'
                  }}
                />
                <span
                  className="text-[10px] font-medium tracking-tight mt-0.5"
                  style={{
                    color: isSelected ? accentColorHex : undefined
                  }}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
