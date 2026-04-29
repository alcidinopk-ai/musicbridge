/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AudioEngine {
  private static instance: AudioEngine;
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public async init(): Promise<void> {
    if (this.context) return;

    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.source = this.context.createMediaStreamSource(this.stream);
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 2048;
      this.source.connect(this.analyser);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      throw err;
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getContext(): AudioContext | null {
    return this.context;
  }

  public async suspend(): Promise<void> {
    if (this.context) await this.context.suspend();
  }

  public async resume(): Promise<void> {
    if (this.context) await this.context.resume();
  }
}

export const audioEngine = AudioEngine.getInstance();
