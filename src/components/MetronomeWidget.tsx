/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Metronome } from '../lib/audio/metronome';
import { audioEngine } from '../lib/audio/engine';
import { Play, Square, Minus, Plus } from 'lucide-react';

export const MetronomeWidget: React.FC = () => {
  const [bpm, setBpm] = useState(120);
  const [beats, setBeats] = useState(4);
  const [isPlaying, setIsPlaying] = useState(false);
  const metronomeRef = useRef<Metronome | null>(null);

  const toggleMetronome = async () => {
    if (!metronomeRef.current) {
      await audioEngine.init();
      const ctx = audioEngine.getContext();
      if (ctx) {
        metronomeRef.current = new Metronome(ctx);
      }
    }

    if (metronomeRef.current) {
      if (isPlaying) {
        metronomeRef.current.stop();
        setIsPlaying(false);
      } else {
        metronomeRef.current.setTempo(bpm);
        metronomeRef.current.setBeatsPerBar(beats);
        metronomeRef.current.start();
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    if (metronomeRef.current) {
      metronomeRef.current.setTempo(bpm);
    }
  }, [bpm]);

  useEffect(() => {
    if (metronomeRef.current) {
      metronomeRef.current.setBeatsPerBar(beats);
    }
  }, [beats]);

  return (
    <div className="hardware-card p-6 w-full max-w-sm flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono uppercase tracking-[2px] text-gray-500">Pulse Metronome</span>
        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#FF4444] shadow-[0_0_8px_#FF4444]' : 'bg-gray-800'}`} />
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="text-6xl font-mono tracking-tighter text-white">
          {bpm}
        </div>
        <span className="text-[10px] font-mono text-gray-500 uppercase">Beats Per Minute</span>
      </div>

      <div className="flex justify-center items-center gap-4">
        <button 
          onClick={() => setBpm(b => Math.max(40, b - 1))}
          className="p-2 rounded-full border border-gray-700 hover:bg-white/5"
        >
          <Minus size={16} />
        </button>
        <input 
          type="range" 
          min="40" 
          max="240" 
          value={bpm} 
          onChange={(e) => setBpm(parseInt(e.target.value))}
          className="w-full accent-[#FF4444]"
        />
        <button 
          onClick={() => setBpm(b => Math.min(240, b + 1))}
          className="p-2 rounded-full border border-gray-700 hover:bg-white/5"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono text-gray-500 uppercase">Beats/Bar</span>
          <select 
            value={beats} 
            onChange={(e) => setBeats(parseInt(e.target.value))}
            className="bg-black border border-gray-700 rounded p-1 text-xs font-mono"
          >
            {[2, 3, 4, 5, 6, 7].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={toggleMetronome}
          className={`flex items-center justify-center gap-2 rounded-lg transition-all ${
            isPlaying 
              ? 'bg-[#FF4444] text-white' 
              : 'bg-white text-black hover:bg-gray-200'
          }`}
        >
          {isPlaying ? <Square size={16} fill="white" /> : <Play size={16} fill="black" />}
          <span className="font-mono text-xs uppercase font-bold">
            {isPlaying ? 'Stop' : 'Start'}
          </span>
        </button>
      </div>
    </div>
  );
};
