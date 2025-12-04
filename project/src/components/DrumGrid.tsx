import { Circle, Disc, Sparkles, CircleDot, Hand, Volume2, Target, Bell, ChevronDown, ChevronRight } from 'lucide-react';
import { DrumType } from '../lib/audioEngine';
import { Bar } from '../lib/supabase';
import { useState } from 'react';

type DrumGridProps = {
  bar: Bar;
  barIndex: number;
  onToggleBeat: (barIndex: number, drum: DrumType, beat: number) => void;
  onToggleAccent: (barIndex: number, beat: number) => void;
  currentBeat: number;
  isCurrentBar: boolean;
  isPlaying: boolean;
};

const DRUMS: { name: DrumType; label: string; icon: typeof Circle }[] = [
  { name: 'hihat', label: 'Hi-Hat', icon: Sparkles },
  { name: 'snare', label: 'Snare', icon: Disc },
  { name: 'kick', label: 'Kick', icon: Circle },
  { name: 'openhat', label: 'Open Hat', icon: CircleDot },
  { name: 'clap', label: 'Clap', icon: Hand },
  { name: 'tom', label: 'Tom', icon: Volume2 },
  { name: 'rim', label: 'Rim', icon: Target },
  { name: 'cowbell', label: 'Cowbell', icon: Bell },
];

const BEAT_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

export function DrumGrid({
  bar,
  barIndex,
  onToggleBeat,
  onToggleAccent,
  currentBeat,
  isCurrentBar,
  isPlaying
}: DrumGridProps) {
  const [showSnareAccents, setShowSnareAccents] = useState(false);
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[140px_repeat(16,1fr)] gap-1 min-w-max">
        <div></div>
        {BEAT_NUMBERS.map((num) => (
          <div key={num} className="text-center text-xs font-medium text-navy-600 pb-1">
            {num}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[140px_repeat(16,1fr)] gap-1 min-w-max">
        {DRUMS.map(({ name, label, icon: Icon }) => (
          <>
            <div key={name} className="contents">
              <div className="flex items-center justify-between gap-2 px-4 py-2 bg-tan-100 rounded">
                <div className="flex items-center gap-2">
                  <Icon size={16} className="text-gold-600" />
                  <span className="text-sm font-medium text-navy-800">{label}</span>
                </div>
                {name === 'snare' && (
                  <button
                    onClick={() => setShowSnareAccents(!showSnareAccents)}
                    className="text-navy-600 hover:text-gold-600 transition-colors"
                    title={showSnareAccents ? 'Hide accents' : 'Show accents'}
                  >
                    {showSnareAccents ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
              </div>
              {bar[name].map((active, beatIndex) => (
                <button
                  key={beatIndex}
                  onClick={() => onToggleBeat(barIndex, name, beatIndex)}
                  onKeyDown={(e) => {
                    if (e.code === 'Space') {
                      e.preventDefault();
                    }
                  }}
                  className={`
                    aspect-square rounded transition-all duration-100
                    ${active
                      ? 'bg-gold-500 shadow-sm'
                      : 'bg-tan-300 hover:bg-tan-400'
                    }
                    ${isCurrentBar && isPlaying && currentBeat === beatIndex
                      ? 'ring-2 ring-gold-400 ring-offset-1'
                      : ''
                    }
                    ${beatIndex % 4 === 0 ? 'border-l-2 border-navy-300' : ''}
                  `}
                />
              ))}
            </div>
            {name === 'snare' && showSnareAccents && (
              <div key="snare-accents" className="contents">
                <div className="flex items-center justify-start gap-2 px-4 py-2 bg-amber-50 rounded border border-amber-200">
                  <Sparkles size={14} className="text-amber-600" />
                  <span className="text-xs font-semibold text-amber-800">Accents</span>
                </div>
                {(bar.snare_accent || Array(16).fill(false)).map((active, beatIndex) => {
                  const snareActive = bar.snare[beatIndex];
                  return (
                    <button
                      key={`accent-${beatIndex}`}
                      onClick={() => onToggleAccent(barIndex, beatIndex)}
                      onKeyDown={(e) => {
                        if (e.code === 'Space') {
                          e.preventDefault();
                        }
                      }}
                      className={`
                        aspect-square rounded-sm transition-all duration-150
                        ${active
                          ? 'bg-amber-600 shadow-md border-2 border-amber-700'
                          : snareActive
                          ? 'bg-amber-100 hover:bg-amber-200 border border-amber-300'
                          : 'bg-tan-200 hover:bg-tan-300 border border-tan-300 opacity-50'
                        }
                        ${isCurrentBar && isPlaying && currentBeat === beatIndex
                          ? 'ring-2 ring-amber-400 ring-offset-1'
                          : ''
                        }
                        ${beatIndex % 4 === 0 ? 'border-l-2 border-navy-400' : ''}
                      `}
                      title={active ? 'Accent ON (louder)' : snareActive ? 'Click to accent' : 'Click to add snare + accent'}
                    />
                  );
                })}
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
}
