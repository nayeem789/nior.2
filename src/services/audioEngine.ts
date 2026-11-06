import { Song } from '../types/music';

export interface EqualizerBand {
  frequency: number;
  label: string;
  gain: number; // -12dB to +12dB
  filterNode?: BiquadFilterNode;
}

export type PresetName = 'Normal' | 'Bass Boost' | 'Treble' | 'Vocal' | 'Rock' | 'Jazz' | 'Electronic' | 'Acoustic';

export const EQ_PRESETS: Record<PresetName, { bands: number[]; bassBoost: number }> = {
  Normal: { bands: [0, 0, 0, 0, 0], bassBoost: 0 },
  'Bass Boost': { bands: [7, 5, 2, 0, -1], bassBoost: 80 },
  Treble: { bands: [-2, 0, 2, 6, 8], bassBoost: 0 },
  Vocal: { bands: [-1, 3, 6, 4, 1], bassBoost: 10 },
  Rock: { bands: [5, 3, -1, 4, 6], bassBoost: 40 },
  Jazz: { bands: [3, 2, -1, 2, 4], bassBoost: 20 },
  Electronic: { bands: [6, 4, 0, 3, 5], bassBoost: 60 },
  Acoustic: { bands: [3, 2, 2, 4, 3], bassBoost: 15 },
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;
  private masterGain: GainNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private filters: BiquadFilterNode[] = [];

  public bands: EqualizerBand[] = [
    { frequency: 60, label: '60Hz', gain: 0 },
    { frequency: 230, label: '230Hz', gain: 0 },
    { frequency: 910, label: '910Hz', gain: 0 },
    { frequency: 3600, label: '3.6kHz', gain: 0 },
    { frequency: 14000, label: '14kHz', gain: 0 },
  ];
  public bassBoost = 20; // 0 to 100
  public eqEnabled = true;

  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;
  private currentSong: Song | null = null;
  private isPlaying = false;

  private initAudioContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement && this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.audioElement.currentTime, this.audioElement.duration || this.currentSong?.duration || 0);
      }
    });

    this.audioElement.addEventListener('ended', () => {
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    });

    try {
      this.mediaSourceNode = this.ctx.createMediaElementSource(this.audioElement);
    } catch {
      // Handled if already created
    }

    this.masterGain = this.ctx.createGain();

    // Bass boost filter (lowshelf)
    this.bassFilter = this.ctx.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.value = 100;
    this.bassFilter.gain.value = (this.bassBoost / 100) * 12;

    // 5-Band parametric filters
    this.filters = this.bands.map((band, idx) => {
      const filter = this.ctx!.createBiquadFilter();
      if (idx === 0) {
        filter.type = 'lowshelf';
      } else if (idx === this.bands.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1.4;
      }
      filter.frequency.value = band.frequency;
      filter.gain.value = band.gain;
      band.filterNode = filter;
      return filter;
    });

    // Chain: Input -> BassFilter -> Filter 0 -> Filter 1 -> ... -> MasterGain -> Destination
    let lastNode: AudioNode = this.bassFilter;
    for (const filter of this.filters) {
      lastNode.connect(filter);
      lastNode = filter;
    }
    lastNode.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    if (this.mediaSourceNode) {
      this.mediaSourceNode.connect(this.bassFilter);
    }
  }

  public setCallbacks(onTimeUpdate: (time: number, duration: number) => void, onEnded: () => void) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;
  }

  public async playSong(song: Song) {
    this.initAudioContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.currentSong = song;
    this.isPlaying = true;

    // Media Session metadata for lockscreen and notification media controls
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album,
        artwork: song.albumArt ? [{ src: song.albumArt, sizes: '512x512', type: 'image/jpeg' }] : []
      });

      navigator.mediaSession.setActionHandler('play', () => this.resume());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime != null) this.seek(details.seekTime);
      });
    }

    if (song.audioUrl && this.audioElement) {
      this.audioElement.src = song.audioUrl;
      this.audioElement.currentTime = 0;
      try {
        await this.audioElement.play();
      } catch (err) {
        console.warn('Playback error:', err);
      }
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public resume() {
    this.isPlaying = true;
    if (this.audioElement && this.audioElement.src) {
      this.audioElement.play().catch(() => {});
    }
  }

  public seek(seconds: number) {
    if (this.audioElement && this.audioElement.src) {
      this.audioElement.currentTime = seconds;
    }
  }

  public setBandGain(index: number, gainDb: number) {
    if (index >= 0 && index < this.bands.length) {
      this.bands[index].gain = gainDb;
      if (this.filters[index] && this.eqEnabled) {
        this.filters[index].gain.value = gainDb;
      }
    }
  }

  public setBassBoost(level: number) {
    this.bassBoost = Math.max(0, Math.min(100, level));
    if (this.bassFilter && this.eqEnabled) {
      this.bassFilter.gain.value = (this.bassBoost / 100) * 14;
    }
  }

  public applyPreset(name: PresetName) {
    const preset = EQ_PRESETS[name];
    if (preset) {
      preset.bands.forEach((gain, i) => this.setBandGain(i, gain));
      this.setBassBoost(preset.bassBoost);
    }
  }

  public setEqEnabled(enabled: boolean) {
    this.eqEnabled = enabled;
    if (this.filters.length > 0) {
      this.filters.forEach((filter, idx) => {
        filter.gain.value = enabled ? this.bands[idx].gain : 0;
      });
    }
    if (this.bassFilter) {
      this.bassFilter.gain.value = enabled ? (this.bassBoost / 100) * 14 : 0;
    }
  }

  public resetEq() {
    this.bands.forEach((b, i) => this.setBandGain(i, 0));
    this.setBassBoost(0);
    this.setEqEnabled(true);
  }

  public getCurrentTime(): number {
    return this.audioElement?.currentTime || 0;
  }

  public getDuration(): number {
    return this.audioElement?.duration || this.currentSong?.duration || 0;
  }
}

export const audioEngine = new AudioEngine();
