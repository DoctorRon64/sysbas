import p5 from "p5";

// Firefox does not implement AudioParam.cancelAndHoldAtTime, which Tone.js
// (inside p5.sound) calls for every ramp, e.g. osc.freq() and osc.amp().
const audioParamProto = (globalThis as any).AudioParam?.prototype;
if (audioParamProto && typeof audioParamProto.cancelAndHoldAtTime !== "function") {
  audioParamProto.cancelAndHoldAtTime = function (
    this: AudioParam,
    cancelTime: number
  ) {
    const value = this.value;
    this.cancelScheduledValues(cancelTime);
    this.setValueAtTime(value, cancelTime);
    return this;
  };
}

// p5.sound is a classic script that expects a global `p5`.
(globalThis as any).p5 = p5;

await import("p5.sound/dist/p5.sound.min.js");

/**
 * SysBas helper: play a short MIDI note.
 * makeNote(midi, amplitude 0..1, durationMs)
 */
export function makeNote(
  midiNote: number,
  amplitude = 0.5,
  durationMs = 100
): void {
  const P5 = (globalThis as any).p5;
  if (!P5?.Oscillator) {
    console.warn("p5.sound is not loaded; makeNote() skipped.");
    return;
  }

  const freq = 440 * 2 ** ((midiNote - 69) / 12);
  const durationSec = Math.max(durationMs, 1) / 1000;
  const amp = Math.max(0, Math.min(1, amplitude));

  const osc = new P5.Oscillator("sine");
  osc.freq(freq);
  osc.amp(0);
  osc.start();
  osc.amp(amp, 0.01);
  osc.amp(0, Math.min(0.2, durationSec * 0.4), durationSec);

  window.setTimeout(() => {
    try {
      osc.stop();
    } catch {
      // already stopped
    }
  }, durationMs + 250);
}

(globalThis as any).makeNote = makeNote;

export { p5 };
export default p5;
