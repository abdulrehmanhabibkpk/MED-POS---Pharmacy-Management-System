// POS Sound Engine with Instant In-Memory AudioBuffer decoding for 0-latency beep
class POSSoundEngine {
  private ctx: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
      // Unlock audio on first user touch/click (required by mobile Android browsers)
      const unlock = () => {
        this.unlockAudio();
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('click', unlock, { once: true });
      window.addEventListener('touchstart', unlock, { once: true });
    }
  }

  private async init() {
    try {
      this.audioEl = new Audio('/freesound_community-store-scanner-beep-90395.mp3');
      this.audioEl.preload = 'auto';

      // Pre-fetch and decode array buffer for instant AudioBufferSourceNode playback
      const res = await fetch('/freesound_community-store-scanner-beep-90395.mp3');
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.toLowerCase().includes('html')) {
          // Do not attempt decoding HTML payload as audio
          return;
        }
        const arrayBuf = await res.arrayBuffer();
        const ctx = this.getContext();
        if (ctx) {
          try {
            const decoded = await ctx.decodeAudioData(arrayBuf);
            this.audioBuffer = decoded;
          } catch (e) {
            // Silently fall back
          }
        }
      }
    } catch {
      // fallback
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
    return this.ctx;
  }

  public unlockAudio() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    this.isUnlocked = true;
  }

  // Plays the custom MP3 sound with 0ms latency
  playScanBeep() {
    try {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Method 1: Instant Web Audio Buffer (Fastest, zero delay)
      if (ctx && this.audioBuffer) {
        const source = ctx.createBufferSource();
        source.buffer = this.audioBuffer;
        const gainNode = ctx.createGain();
        gainNode.gain.value = 1.0;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        return;
      }

      // Method 2: HTMLAudioElement
      if (this.audioEl) {
        this.audioEl.currentTime = 0;
        const p = this.audioEl.play();
        if (p) {
          p.catch(() => {
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

  // Super-crisp synthetic laser beep fallback (2400Hz)
  playSynthBeep() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1900, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  playDoubleBeep() {
    this.playScanBeep();
    setTimeout(() => {
      this.playScanBeep();
    }, 110);
  }

  playSuccessChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.18);
      });
    } catch {}
  }

  playErrorBeep() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }
}

export const posSound = new POSSoundEngine();
