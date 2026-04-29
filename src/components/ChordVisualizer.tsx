/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../lib/audio/engine';
import { NOTES, noteFromPitch } from '../lib/audio/pitch';
import { detectChord, ChordResult } from '../lib/audio/chords';

export const ChordVisualizer: React.FC = () => {
  const [chord, setChord] = useState<ChordResult | null>(null);
  const [isActive, setIsActive] = useState(false);
  const requestRef = useRef<number>(null);

  const getPeakFrequencies = (data: Float32Array, sampleRate: number) => {
    const peaks: number[] = [];
    const threshold = -50; // dB
    
    // Simple peak picking
    for (let i = 1; i < data.length - 1; i++) {
        if (data[i] > threshold && data[i] > data[i-1] && data[i] > data[i+1]) {
            peaks.push(i * sampleRate / (data.length * 2));
        }
    }
    return peaks.slice(0, 5); // Take top 5
  };

  const updateChords = () => {
    const analyser = audioEngine.getAnalyser();
    if (!analyser) return;

    const dataSize = analyser.frequencyBinCount;
    const frequencyData = new Float32Array(dataSize);
    analyser.getFloatFrequencyData(frequencyData);

    const peaks = getPeakFrequencies(frequencyData, analyser.context.sampleRate);
    const detected = detectChord(peaks);
    
    if (detected) {
        setChord(detected);
    }

    requestRef.current = requestAnimationFrame(updateChords);
  };

  const toggleChordDetection = async () => {
    if (!isActive) {
      await audioEngine.init();
      setIsActive(true);
      requestRef.current = requestAnimationFrame(updateChords);
    } else {
      setIsActive(false);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="hardware-card p-6 w-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono uppercase tracking-[2px] text-gray-500">Chord Intelligence</span>
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]' : 'bg-gray-800'}`} />
      </div>

      <div className="lcd-display w-full h-40 rounded flex flex-col items-center justify-center relative">
        <div className="absolute top-2 left-4 text-[8px] font-mono text-[#3b82f6]/40 uppercase tracking-widest">Polyphonic Analysis</div>
        
        {chord ? (
          <div className="flex flex-col items-center">
            <div className="text-7xl font-mono text-[#3b82f6] tracking-tighter shadow-lg">
              {chord.name}
            </div>
            <div className="flex gap-2 mt-2">
              {chord.notes.map(n => (
                <span key={n} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3b82f6]/20 text-[#3b82f6]">
                  {n}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center opacity-20">
            <span className="text-4xl font-mono text-white">---</span>
            <span className="text-[10px] font-mono mt-2">WAITING FOR INPUT</span>
          </div>
        )}

        <div className="absolute bottom-2 right-4 text-[8px] font-mono text-gray-700">MB-CH-V1</div>
      </div>

      <button 
        onClick={toggleChordDetection}
        className={`w-full py-3 rounded-lg font-mono text-xs uppercase tracking-[1px] transition-all
          ${isActive 
            ? 'bg-transparent border border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10' 
            : 'bg-[#3b82f6] text-white hover:bg-[#3b82f6]/80'}
        `}
      >
        {isActive ? 'Stop Listening' : 'Identify Chords'}
      </button>
    </div>
  );
};
