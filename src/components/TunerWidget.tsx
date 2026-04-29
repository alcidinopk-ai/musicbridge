/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { audioEngine } from '../lib/audio/engine';
import { autoCorrelate, noteFromPitch, NOTES, centsOffFromPitch } from '../lib/audio/pitch';

export const TunerWidget: React.FC = () => {
  const [pitch, setPitch] = useState<number | null>(null);
  const [note, setNote] = useState<string>('--');
  const [cents, setCents] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const requestRef = useRef<number>(null);

  const updatePitch = () => {
    const analyser = audioEngine.getAnalyser();
    if (!analyser) return;

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);
    const freq = autoCorrelate(buffer, analyser.context.sampleRate);

    if (freq !== -1) {
      const noteNum = noteFromPitch(freq);
      setPitch(freq);
      setNote(NOTES[noteNum % 12]);
      setCents(centsOffFromPitch(freq, noteNum));
    } else {
      setPitch(null);
    }

    requestRef.current = requestAnimationFrame(updatePitch);
  };

  const toggleTuner = async () => {
    if (!isActive) {
      await audioEngine.init();
      setIsActive(true);
      requestRef.current = requestAnimationFrame(updatePitch);
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
    <div className="hardware-card p-6 w-full max-w-sm flex flex-col items-center gap-4">
      <div className="flex justify-between w-full items-center mb-2">
        <span className="text-[10px] font-mono uppercase tracking-[2px] text-gray-500">Chromatic Tuner</span>
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#00FF9C] led-glow' : 'bg-gray-800'}`} />
      </div>

      <div className="lcd-display w-full h-32 rounded flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-2 left-4 text-[10px] font-mono text-[#00FF9C]/40">AUTO</div>
        
        <div className="text-5xl font-mono text-[#00FF9C] tracking-tighter">
          {note}
        </div>
        
        <div className="mt-2 text-[10px] font-mono text-[#00FF9C]/60">
          {pitch ? `${pitch.toFixed(1)} Hz` : 'SILENCE'}
        </div>

        {/* Gauge */}
        <div className="absolute bottom-4 w-full px-8">
          <div className="h-[1px] bg-[#00FF9C]/20 w-full relative">
            <div className="absolute left-1/2 -top-1 w-[1px] h-3 bg-[#00FF9C]" />
            <motion.div 
              animate={{ x: `${(cents / 50) * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute left-1/2 -top-2 w-1 h-5 bg-[#FF4444] shadow-[0_0_5px_#FF4444]" 
              style={{ marginLeft: '-2px' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[8px] font-mono text-[#00FF9C]/40">
            <span>-50</span>
            <span>0</span>
            <span>+50</span>
          </div>
        </div>
      </div>

      <button 
        onClick={toggleTuner}
        className={`w-full py-3 rounded-lg font-mono text-xs uppercase tracking-[1px] transition-all
          ${isActive 
            ? 'bg-transparent border border-[#FF4444] text-[#FF4444] hover:bg-[#FF4444]/10' 
            : 'bg-[#00FF9C] text-black hover:bg-[#00FF9C]/80'}
        `}
      >
        {isActive ? 'Stop Tuner' : 'Start Tuner'}
      </button>
    </div>
  );
};
