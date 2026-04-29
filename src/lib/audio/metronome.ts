/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class Metronome {
  private audioContext: AudioContext;
  private nextNoteTime: number = 0;
  private timerID: number | null = null;
  private tempo: number = 120;
  private lookahead: number = 25.0;
  private scheduleAheadTime: number = 0.1;
  private currentQuarterNote: number = 0;
  private beatsPerBar: number = 4;
  private isRunning: boolean = false;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  private nextNote(): void {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += secondsPerBeat;
    this.currentQuarterNote = (this.currentQuarterNote + 1) % this.beatsPerBar;
  }

  private scheduleNote(beatNumber: number, time: number): void {
    const osc = this.audioContext.createOscillator();
    const envelope = this.audioContext.createGain();

    osc.frequency.value = beatNumber === 0 ? 1000 : 800;
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

    osc.connect(envelope);
    envelope.connect(this.audioContext.destination);

    osc.start(time);
    osc.stop(time + 0.03);
  }

  private scheduler(): void {
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentQuarterNote, this.nextNoteTime);
      this.nextNote();
    }
    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.currentQuarterNote = 0;
    this.nextNoteTime = this.audioContext.currentTime + 0.05;
    this.scheduler();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timerID) window.clearTimeout(this.timerID);
  }

  public setTempo(newTempo: number): void {
    this.tempo = newTempo;
  }

  public setBeatsPerBar(beats: number): void {
    this.beatsPerBar = beats;
  }
  
  public getStatus(): boolean {
    return this.isRunning;
  }
}
