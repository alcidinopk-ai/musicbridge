/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NOTES, noteFromPitch } from './pitch';

export interface ChordResult {
  name: string;
  notes: string[];
}

export function detectChord(peakFrequencies: number[]): ChordResult | null {
  if (peakFrequencies.length < 3) return null;

  const activeNotes = Array.from(new Set(
    peakFrequencies
      .map(f => NOTES[noteFromPitch(f) % 12])
  )).sort();

  if (activeNotes.length < 3) return null;

  // Simplified Chord Mapping (Try common triads)
  const chromatics = NOTES;
  
  for (let i = 0; i < chromatics.length; i++) {
    const root = chromatics[i];
    const m3 = chromatics[(i + 3) % 12];
    const M3 = chromatics[(i + 4) % 12];
    const p5 = chromatics[(i + 7) % 12];

    // Check Major
    if (activeNotes.includes(root) && activeNotes.includes(M3) && activeNotes.includes(p5)) {
      return { name: root, notes: [root, M3, p5] };
    }
    // Check Minor
    if (activeNotes.includes(root) && activeNotes.includes(m3) && activeNotes.includes(p5)) {
      return { name: root + "m", notes: [root, m3, p5] };
    }
  }

  return null;
}
