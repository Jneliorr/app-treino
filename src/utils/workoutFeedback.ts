// Audio and haptic feedback utilities for active workout
let audioCtx: AudioContext | null = null;
let compressor: DynamicsCompressorNode | null = null;
let masterGain: GainNode | null = null;

export type SoundThemeMode = 'mario' | 'gym';

export function isAudioFeedbackEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const saved = localStorage.getItem('workout_audio_enabled');
    return saved !== null ? saved === 'true' : true;
  } catch {
    return true;
  }
}

export function setAudioFeedbackEnabled(enabled: boolean): void {
  try {
    localStorage.setItem('workout_audio_enabled', String(enabled));
  } catch {}
}

export function getAudioSoundTheme(): SoundThemeMode {
  if (typeof window === 'undefined') return 'mario';
  try {
    const saved = localStorage.getItem('workout_audio_sound_theme');
    return saved === 'gym' ? 'gym' : 'mario'; // Default to Super Mario World!
  } catch {
    return 'mario';
  }
}

export function setAudioSoundTheme(theme: SoundThemeMode): void {
  try {
    localStorage.setItem('workout_audio_sound_theme', theme);
  } catch {}
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Returns a high-gain audio destination through a dynamics compressor
 * to maximize loudness and prevent clipping on smartphone speakers and headphones
 */
function getOutputNode(ctx: AudioContext): AudioNode {
  try {
    if (!compressor || !masterGain || compressor.context !== ctx) {
      compressor = ctx.createDynamicsCompressor();
      // Fast attack and high compression ratio for punchy gym & retro audio
      compressor.threshold.setValueAtTime(-8, ctx.currentTime);
      compressor.knee.setValueAtTime(6, ctx.currentTime);
      compressor.ratio.setValueAtTime(14, ctx.currentTime);
      compressor.attack.setValueAtTime(0.002, ctx.currentTime);
      compressor.release.setValueAtTime(0.12, ctx.currentTime);

      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(1.0, ctx.currentTime);

      compressor.connect(masterGain);
      masterGain.connect(ctx.destination);
    }
    return compressor;
  } catch {
    return ctx.destination;
  }
}

// ============================================================================
// SUPER MARIO WORLD (NINTENDO) SYNTHESIZED SOUND EFFECTS
// ============================================================================

/**
 * The iconic Super Mario Coin Sound (Moeda de Ouro)
 * Note 1: B5 (987.77 Hz) -> Note 2: E6 (1318.51 Hz) with SNES pulse tone
 */
function playMarioCoinSound(ctx: AudioContext, output: AudioNode): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'square';
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3600, now); // Warm 16-bit SNES SPC700 feel

  osc.frequency.setValueAtTime(987.77, now); // B5
  osc.frequency.setValueAtTime(1318.51, now + 0.075); // E6

  gain.gain.setValueAtTime(0.75, now);
  gain.gain.setValueAtTime(0.85, now + 0.075);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(output);

  osc.start(now);
  osc.stop(now + 0.45);
}

/**
 * Mario Kart / Mario P-Switch Countdown Pip (3, 2, 1)
 * High-pitched, crisp retro pip that cleanly cuts through loud music
 */
function playMarioCountdownPip(ctx: AudioContext, output: AudioNode): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'square';
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3200, now);

  osc.frequency.setValueAtTime(1046.5, now); // C6 retro pip

  gain.gain.setValueAtTime(0.88, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(output);

  osc.start(now);
  osc.stop(now + 0.11);
}

/**
 * The legendary Super Mario 1-Up Mushroom Chime (Cogumelo 1-UP / Vida Extra)
 * Notes: E5 (659Hz) -> G5 (784Hz) -> E6 (1319Hz) -> C6 (1047Hz) -> D6 (1175Hz) -> G6 (1568Hz)
 * Plays at high volume when rest finishes, empowering you for the next set!
 */
function playMarioOneUpChime(ctx: AudioContext, output: AudioNode): void {
  const now = ctx.currentTime;
  const notes = [
    { freq: 659.25, dur: 0.085 }, // E5
    { freq: 783.99, dur: 0.085 }, // G5
    { freq: 1318.51, dur: 0.085 }, // E6
    { freq: 1046.50, dur: 0.085 }, // C6
    { freq: 1174.66, dur: 0.085 }, // D6
    { freq: 1567.98, dur: 0.350 }, // G6 (sustained high ringing finish)
  ];

  let currentOffset = 0;
  notes.forEach(({ freq, dur }, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'square';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3800, now + currentOffset);

    osc.frequency.setValueAtTime(freq, now + currentOffset);

    const isLast = idx === notes.length - 1;
    const noteGain = isLast ? 0.95 : 0.85;

    gain.gain.setValueAtTime(noteGain, now + currentOffset);
    gain.gain.exponentialRampToValueAtTime(0.001, now + currentOffset + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    osc.start(now + currentOffset);
    osc.stop(now + currentOffset + dur + 0.02);

    currentOffset += (isLast ? dur : 0.085);
  });
}

/**
 * Super Mario World Course Clear / Level Complete Victory Fanfare
 */
function playMarioCourseClear(ctx: AudioContext, output: AudioNode): void {
  const now = ctx.currentTime;
  const melody = [
    { freq: 392.00, time: 0.00, dur: 0.09 }, // G4
    { freq: 523.25, time: 0.09, dur: 0.09 }, // C5
    { freq: 659.25, time: 0.18, dur: 0.09 }, // E5
    { freq: 783.99, time: 0.27, dur: 0.09 }, // G5
    { freq: 1046.50, time: 0.36, dur: 0.09 }, // C6
    { freq: 1318.51, time: 0.45, dur: 0.18 }, // E6
    { freq: 1567.98, time: 0.63, dur: 0.18 }, // G6
    { freq: 1318.51, time: 0.81, dur: 0.30 }, // E6
    // Final triumphant power chord
    { freq: 830.61, time: 1.15, dur: 0.15 }, // Ab5
    { freq: 932.33, time: 1.30, dur: 0.15 }, // Bb5
    { freq: 1046.50, time: 1.45, dur: 0.45 }, // C6!
  ];

  melody.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4000, now + time);

    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0.85, now + time);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    osc.start(now + time);
    osc.stop(now + time + dur + 0.03);
  });
}

/**
 * Mario Jump / Blip for weight increments
 */
function playMarioJumpChirp(ctx: AudioContext, output: AudioNode, isUp: boolean): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  const startF = isUp ? 440 : 780;
  const endF = isUp ? 880 : 380;

  osc.frequency.setValueAtTime(startF, now);
  osc.frequency.exponentialRampToValueAtTime(endF, now + 0.06);

  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain);
  gain.connect(output);

  osc.start(now);
  osc.stop(now + 0.065);
}

// ============================================================================
// PUBLIC EXPORTED SOUND TRIGGER FUNCTIONS
// ============================================================================

/**
 * Play sound when a set is marked as completed
 * (Mario Mode: Moeda dourada do Super Mario World! | Gym Mode: Chime suave)
 */
export function playSetCompletedSound(): void {
  if (!isAudioFeedbackEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const output = getOutputNode(ctx);
    const theme = getAudioSoundTheme();

    if (theme === 'mario') {
      playMarioCoinSound(ctx, output);
    } else {
      // Classic Gym Chime
      const now = ctx.currentTime;
      const notes = [1046.5, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.45, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.18);
        osc.connect(gain);
        gain.connect(output);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.20);
      });
    }
  } catch {}
}

/**
 * Play click when adjusting weight
 */
export function playWeightClickSound(isUp: boolean = true): void {
  if (!isAudioFeedbackEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const output = getOutputNode(ctx);
    const theme = getAudioSoundTheme();

    if (theme === 'mario') {
      playMarioJumpChirp(ctx, output, isUp);
    } else {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isUp ? 800 : 550, now);
      osc.frequency.exponentialRampToValueAtTime(isUp ? 1050 : 420, now + 0.04);
      gain.gain.setValueAtTime(0.20, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + 0.045);
    }
  } catch {}
}

/**
 * Play warning pip for rest timer countdown (3, 2, 1s)
 * (Mario Mode: Pip de largada do Mario Kart / P-Switch | Gym Mode: Bipe penetrante)
 */
export function playCountdownTickSound(): void {
  if (!isAudioFeedbackEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const output = getOutputNode(ctx);
    const theme = getAudioSoundTheme();

    if (theme === 'mario') {
      playMarioCountdownPip(ctx, output);
    } else {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1100, now);
      gain1.gain.setValueAtTime(0.85, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(output);
      osc1.start(now);
      osc1.stop(now + 0.13);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2200, now);
      gain2.gain.setValueAtTime(0.40, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc2.connect(gain2);
      gain2.connect(output);
      osc2.start(now);
      osc2.stop(now + 0.06);
    }
  } catch {}
}

/**
 * Play sound when rest timer finishes (0s)
 * (Mario Mode: Lendário Cogumelo 1-UP / Vida Extra! | Gym Mode: Alarme triplo esportivo)
 */
export function playRestTimerCompleteSound(): void {
  if (!isAudioFeedbackEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const output = getOutputNode(ctx);
    const theme = getAudioSoundTheme();

    if (theme === 'mario') {
      playMarioOneUpChime(ctx, output);
    } else {
      const now = ctx.currentTime;
      const bursts = [
        { freq: 1175, startOffset: 0.0, duration: 0.11, gainVal: 0.88 },
        { freq: 1175, startOffset: 0.15, duration: 0.11, gainVal: 0.88 },
        { freq: 1568, startOffset: 0.30, duration: 0.35, gainVal: 0.98 },
      ];

      bursts.forEach(({ freq, startOffset, duration, gainVal }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + startOffset);
        gain.gain.setValueAtTime(gainVal, now + startOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
        osc.connect(gain);
        gain.connect(output);
        osc.start(now + startOffset);
        osc.stop(now + startOffset + duration + 0.02);

        const oscHarmonic = ctx.createOscillator();
        const gainHarmonic = ctx.createGain();
        oscHarmonic.type = 'sine';
        oscHarmonic.frequency.setValueAtTime(freq * 2, now + startOffset);
        gainHarmonic.gain.setValueAtTime(gainVal * 0.45, now + startOffset);
        gainHarmonic.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration * 0.7);
        oscHarmonic.connect(gainHarmonic);
        gainHarmonic.connect(output);
        oscHarmonic.start(now + startOffset);
        oscHarmonic.stop(now + startOffset + duration + 0.02);
      });
    }
  } catch {}
}

/**
 * Play sound on workout completion
 * (Mario Mode: Super Mario World Course Clear Fanfare! | Gym Mode: Triunfo Academia)
 */
export function playWorkoutFinishedSound(): void {
  if (!isAudioFeedbackEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const output = getOutputNode(ctx);
    const theme = getAudioSoundTheme();

    if (theme === 'mario') {
      playMarioCourseClear(ctx, output);
    } else {
      const now = ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.5];
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.80, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.40);
        osc.connect(gain);
        gain.connect(output);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.45);
      });
    }
  } catch {}
}

/**
 * Trigger strong haptic vibration pattern on mobile devices
 */
export function triggerHapticFeedback(): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate([100, 60, 100, 60, 220]);
    }
  } catch {}
}

/**
 * Trigger a clear single tap vibration
 */
export function triggerLightHaptic(): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(45);
    }
  } catch {}
}


