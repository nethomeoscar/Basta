// Programmatic Web Audio Synthesizer for Retro Game Alerts & Alarms
// Avoids requiring external assets that could fail on sandbox iframes.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play a customized pure-synth tone
export function playBeep(frequency = 600, duration = 0.1, type: OscillatorType = "sine", volume = 0.08) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    // Exponential ramp to avoid speaker pop sounds
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (error) {
    // Graceful catch for browsers blocking autoplay before user gesture
    console.warn("Web Audio API warning:", error);
  }
}

// Play a crisp high-beep for final tens seconds
export function playTensionBeep() {
  playBeep(980, 0.15, "triangle", 0.08);
}

// Play an escalating high-energy game alert when someone shouts BASTA!
export function playBastaSiren() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Series of 4 quick rising arcade sweep tones
    for (let i = 0; i < 4; i++) {
      const timeOffset = i * 0.12;
      const freq = 580 + (i * 240);
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now + timeOffset);
      gainNode.gain.setValueAtTime(0.05, now + timeOffset);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.15);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.15);
    }
  } catch (error) {
    console.warn("Basta siren blocked:", error);
  }
}
