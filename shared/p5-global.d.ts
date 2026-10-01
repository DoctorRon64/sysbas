/// <reference path="../node_modules/@types/p5/global.d.ts" />

declare module "p5.sound/dist/p5.sound.min.js";
declare module "p5.sound/dist/p5.sound.js";

/** SysBas helper: play a MIDI note (amp 0..1, duration in ms). */
declare function makeNote(
  midiNote: number,
  amplitude?: number,
  durationMs?: number
): void;
