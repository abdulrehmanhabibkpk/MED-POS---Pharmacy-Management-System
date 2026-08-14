// POS Scanner Sound Engine with freesound_community-store-scanner-beep-90395.mp3 support and Web Audio fallback
class POSSoundEngine {
  private ctx: AudioContext | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private isAudioLoaded: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.audioEl = new Audio('/freesound_community-store-scanner-beep-90395.mp3');
        this.audioEl.preload = 'auto';
        this.audioEl.volume = 1.0;
        this.audioEl.addEventListener('canplaythrough', () => {
          this.isAudioLoaded = true;
        });
        // Also try relative path
        this.audioEl.addEventListener('error', () => {
          if (this.audioEl) {
            this.audioEl.src = 'freesound_community-store-scanner-beep-90395.mp3';
          }
        });
      } catch {
        // Fallback to web audio
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Primary scanner beep: plays freesound_community-store-scanner-beep-90395.mp3
  playScanBeep() {
    try {
      if (this.audioEl) {
        this.audioEl.currentTime = 0;
        const playPromise = this.audioEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If browser blocks audio element or file is empty, fallback to high-fidelity synth beep
            this.playSynthBeep();
          });
        }
        return;
      }
    } catch {
      // Fallback
    }

    this.playSynthBeep();
  }

  // Classic High-Pitch Laser Scanner Synthetic Beep Fallback (2kHz)
  playSynthBeep() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignore audio policy limits
    }
  }

  // Double beep for wholesale scan
  playDoubleBeep() {
    this.playScanBeep();
    setTimeout(() => {
      this.playScanBeep();
    }, 120);
  }

  // Error Beep (Item not found)
  playErrorBeep() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Ignore
    }
  }
}

export const posSound = new POSSoundEngine();
