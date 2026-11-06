import React, { useState } from 'react';
import { X, RotateCcw, Sliders, Zap } from 'lucide-react';
import { audioEngine, EQ_PRESETS, PresetName } from '../services/audioEngine';

interface Props {
  onClose: () => void;
  accentColorHex: string;
}

export const EqualizerModal: React.FC<Props> = ({ onClose, accentColorHex }) => {
  const [eqEnabled, setEqEnabled] = useState(audioEngine.eqEnabled);
  const [bands, setBands] = useState(audioEngine.bands.map(b => b.gain));
  const [bassBoost, setBassBoost] = useState(audioEngine.bassBoost);
  const [activePreset, setActivePreset] = useState<PresetName | null>('Normal');

  const presets: PresetName[] = [
    'Normal',
    'Bass Boost',
    'Treble',
    'Vocal',
    'Rock',
    'Jazz',
    'Electronic',
    'Acoustic'
  ];

  const handleTogglePower = () => {
    const newState = !eqEnabled;
    setEqEnabled(newState);
    audioEngine.setEqEnabled(newState);
  };

  const handleBandChange = (index: number, val: number) => {
    const nextBands = [...bands];
    nextBands[index] = val;
    setBands(nextBands);
    audioEngine.setBandGain(index, val);
    setActivePreset(null);
  };

  const handleBassBoostChange = (val: number) => {
    setBassBoost(val);
    audioEngine.setBassBoost(val);
    setActivePreset(null);
  };

  const handleSelectPreset = (preset: PresetName) => {
    setActivePreset(preset);
    audioEngine.applyPreset(preset);
    setBands(EQ_PRESETS[preset].bands);
    setBassBoost(EQ_PRESETS[preset].bassBoost);
  };

  const handleReset = () => {
    audioEngine.resetEq();
    setBands([0, 0, 0, 0, 0]);
    setBassBoost(0);
    setEqEnabled(true);
    setActivePreset('Normal');
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md rounded-[32px] p-6 text-[#191624] dark:text-white
                   bg-white/95 dark:bg-[#161224]/95 backdrop-blur-2xl
                   border border-black/[0.08] dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]
                   flex flex-col gap-5 max-h-[90vh] overflow-y-auto no-scrollbar transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-black/[0.06] dark:border-white/10"
              style={{ backgroundColor: `${accentColorHex}20`, color: accentColorHex }}
            >
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191624] dark:text-white tracking-tight">Audio Equalizer</h3>
              <p className="text-xs text-[#777386] dark:text-white/50">5-Band Parametric Hardware DSP</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="Reset Equalizer"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/5 hover:bg-black/[0.08] dark:hover:bg-white/10 text-[#777386] dark:text-white/60 hover:text-[#191624] dark:hover:text-white transition-colors"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/5 hover:bg-black/[0.08] dark:hover:bg-white/10 text-[#777386] dark:text-white/60 hover:text-[#191624] dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Equalizer Power Switch Card */}
        <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/[0.06] dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap size={18} style={{ color: eqEnabled ? accentColorHex : 'rgba(120,120,120,0.5)' }} />
            <div>
              <span className="text-sm font-semibold text-[#191624] dark:text-white block">Equalizer Status</span>
              <span className="text-xs text-[#777386] dark:text-white/50">
                {eqEnabled ? 'Active hardware audio processing' : 'Bypass / Flat frequency response'}
              </span>
            </div>
          </div>

          <button
            onClick={handleTogglePower}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 flex items-center ${
              eqEnabled ? 'justify-end' : 'justify-start bg-black/20 dark:bg-white/20'
            }`}
            style={{ backgroundColor: eqEnabled ? accentColorHex : undefined }}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Presets Horizontal Strip */}
        <div>
          <span className="text-xs font-semibold text-[#777386] dark:text-white/60 mb-2 block uppercase tracking-wider">
            Acoustic Presets
          </span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {presets.map((preset) => {
              const isSelected = activePreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'border-transparent text-white font-semibold shadow-sm'
                      : 'border-black/[0.06] dark:border-white/10 bg-black/[0.03] dark:bg-white/5 text-[#777386] dark:text-white/70 hover:bg-black/[0.06] dark:hover:bg-white/10'
                  }`}
                  style={{
                    backgroundColor: isSelected ? accentColorHex : undefined
                  }}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5-Band Sliders Container */}
        <div className="p-5 rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/[0.06] dark:border-white/10">
          <div className="flex justify-between items-end h-44 px-2">
            {audioEngine.bands.map((band, idx) => {
              const gain = bands[idx];
              return (
                <div key={band.label} className="flex flex-col items-center justify-between h-full">
                  <span
                    className="text-[11px] font-mono tabular-nums font-semibold"
                    style={{ color: gain !== 0 ? accentColorHex : undefined }}
                  >
                    {gain > 0 ? `+${gain}` : gain}dB
                  </span>

                  <div className="relative h-28 flex items-center justify-center my-1">
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={1}
                      value={gain}
                      disabled={!eqEnabled}
                      onChange={(e) => handleBandChange(idx, parseInt(e.target.value, 10))}
                      className="w-28 h-1.5 -rotate-90 appearance-none bg-black/10 dark:bg-white/15 rounded-full cursor-pointer disabled:opacity-40"
                      style={{ accentColor: accentColorHex }}
                    />
                  </div>

                  <span className="text-[11px] font-medium text-[#777386] dark:text-white/60 mt-1">
                    {band.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bass Boost Slider */}
        <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/[0.06] dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#191624] dark:text-white">Dynamic Bass Boost</span>
            <span className="text-xs font-bold font-mono" style={{ color: accentColorHex }}>
              {bassBoost}%
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={bassBoost}
            disabled={!eqEnabled}
            onChange={(e) => handleBassBoostChange(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-full appearance-none bg-black/10 dark:bg-white/15 cursor-pointer disabled:opacity-40"
            style={{ accentColor: accentColorHex }}
          />
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white shadow-lg transition-transform active:scale-[0.99] focus:outline-none"
          style={{ backgroundColor: accentColorHex }}
        >
          Apply & Return to Player
        </button>
      </div>
    </div>
  );
};
