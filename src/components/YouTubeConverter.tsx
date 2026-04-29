/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Youtube, Search, Download, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const YouTubeConverter: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{title: string, artist: string, chords: string[]} | null>(null);

  const handleConvert = async () => {
    if (!url) return;
    setIsProcessing(true);
    
    // Simulate pipeline
    // In a real app, this would hit /api/convert
    setTimeout(() => {
      setResult({
        title: "Imagine",
        artist: "John Lennon",
        chords: ["C", "Cmaj7", "F", "C", "Cmaj7", "F", "Am", "Dm", "G", "G7"]
      });
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="hardware-card p-6 w-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono uppercase tracking-[2px] text-gray-500">YouTube Bridge</span>
        <div className={`w-2 h-2 rounded-full ${isProcessing ? 'animate-pulse bg-yellow-400' : 'bg-gray-800'}`} />
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Paste YouTube Link..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-black border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-sm font-mono focus:border-[#00FF9C] outline-none transition-all"
          />
        </div>
        <button 
          onClick={handleConvert}
          disabled={isProcessing}
          className="bg-white text-black px-6 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-gray-200 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Bridge'}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lcd-display rounded-lg p-4 flex flex-col gap-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[#00FF9C] font-bold text-lg mb-1">{result.title}</h3>
                <p className="text-[#00FF9C]/60 text-[10px] uppercase font-mono">{result.artist}</p>
              </div>
              <Download size={16} className="text-[#00FF9C]/40 cursor-pointer hover:text-[#00FF9C]" />
            </div>

            <div className="flex flex-wrap gap-2">
              {result.chords.map((c, i) => (
                <div key={i} className="flex flex-col items-center min-w-[40px] p-2 border border-[#00FF9C]/20 rounded">
                  <span className="text-xl font-bold text-[#00FF9C]">{c}</span>
                  <span className="text-[8px] text-[#00FF9C]/40 mt-1">V{i % 4 + 1}</span>
                </div>
              ))}
            </div>

            <button className="w-full mt-2 py-2 border border-[#00FF9C]/20 rounded text-[#00FF9C] text-[10px] font-mono uppercase hover:bg-[#00FF9C]/10 transition-all flex items-center justify-center gap-2">
              <Music size={12} /> Sync with Player
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !isProcessing && (
        <div className="border border-dashed border-gray-800 rounded-lg p-10 flex flex-col items-center justify-center opacity-30">
          <Search size={32} className="mb-2" />
          <p className="text-[10px] font-mono uppercase">Enter a URL to generate chords</p>
        </div>
      )}
    </div>
  );
};
