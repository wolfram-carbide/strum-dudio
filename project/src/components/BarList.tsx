import { Copy, Trash2, ChevronLeft, ChevronRight, Clipboard, Plus } from 'lucide-react';
import { Bar } from '../lib/supabase';
import { DrumType } from '../lib/audioEngine';
import { PlaybackState } from './DrumMachine';
import { DrumGrid } from './DrumGrid';
import { Tooltip } from './Tooltip';

type BarListProps = {
  bars: Bar[];
  currentBar: number;
  currentBeat: number;
  playbackState: PlaybackState;
  selectedBar: number | null;
  onToggleBeat: (barIndex: number, drum: DrumType, beat: number) => void;
  onToggleAccent: (barIndex: number, beat: number) => void;
  onDeleteBar: (index: number) => void;
  onDuplicateBar: (index: number) => void;
  onCopyBar: (index: number) => void;
  onPasteBar: (afterIndex: number) => void;
  onMoveBar: (fromIndex: number, toIndex: number) => void;
  onClearBar: (index: number) => void;
  onSelectBar: (index: number | null) => void;
  onAddBar: () => void;
  hasCopiedBar: boolean;
  canAddBar: boolean;
  barRefs?: React.MutableRefObject<(HTMLDivElement | null)[]>;
};

export function BarList({
  bars,
  currentBar,
  currentBeat,
  playbackState,
  selectedBar,
  onToggleBeat,
  onToggleAccent,
  onDeleteBar,
  onDuplicateBar,
  onCopyBar,
  onPasteBar,
  onMoveBar,
  onClearBar,
  onSelectBar,
  onAddBar,
  hasCopiedBar,
  canAddBar,
  barRefs
}: BarListProps) {
  return (
    <div className="flex gap-6 p-6 overflow-x-auto">
      {bars.map((bar, index) => (
        <div
          key={index}
          className="flex-shrink-0"
          ref={(el) => {
            if (barRefs) {
              barRefs.current[index] = el;
            }
          }}
        >
          <div
            className={`
              relative border rounded-lg p-4 transition-all
              ${currentBar === index && playbackState !== 'stopped'
                ? 'border-gold-500 bg-gold-50/30 shadow-md'
                : 'border-tan-300 bg-tan-50'
              }
              ${selectedBar === index ? 'ring-2 ring-gold-500' : ''}
            `}
          >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider">
              Bar {index + 1}
            </h3>

            <div className="flex items-center gap-1">
              <Tooltip text="Move left">
                <button
                  onClick={() => onMoveBar(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                  className="p-1 rounded bg-tan-200 hover:bg-tan-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
              </Tooltip>

              <Tooltip text="Move right">
                <button
                  onClick={() => onMoveBar(index, Math.min(bars.length - 1, index + 1))}
                  disabled={index === bars.length - 1}
                  className="p-1 rounded bg-tan-200 hover:bg-tan-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </Tooltip>

              <Tooltip text="Copy this bar">
                <button
                  onClick={() => onCopyBar(index)}
                  className="p-1 rounded bg-navy-600 hover:bg-navy-700 text-white transition-colors"
                >
                  <Copy size={14} />
                </button>
              </Tooltip>

              <Tooltip text="Paste bar">
                <button
                  onClick={() => onPasteBar(index)}
                  disabled={!hasCopiedBar}
                  className="p-1 rounded bg-navy-600 hover:bg-navy-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Clipboard size={14} />
                </button>
              </Tooltip>

              <Tooltip text="Clear bar">
                <button
                  onClick={() => {
                    if (confirm('Clear this bar?')) {
                      onClearBar(index);
                    }
                  }}
                  className="p-1 rounded bg-navy-600 hover:bg-navy-700 text-white transition-colors"
                >
                  <Square size={14} />
                </button>
              </Tooltip>

              <Tooltip text="Delete bar">
                <button
                  onClick={() => {
                    if (bars.length > 1 && confirm('Delete this bar?')) {
                      onDeleteBar(index);
                    }
                  }}
                  disabled={bars.length === 1}
                  className="p-1 rounded bg-navy-600 hover:bg-navy-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </Tooltip>
            </div>
          </div>

            <DrumGrid
              bar={bar}
              barIndex={index}
              onToggleBeat={onToggleBeat}
              onToggleAccent={onToggleAccent}
              currentBeat={currentBeat}
              isCurrentBar={currentBar === index}
              isPlaying={playbackState === 'playing'}
            />
          </div>
        </div>
      ))}

      <div className="flex-shrink-0 flex items-center">
        <Tooltip text="Add bar">
          <button
            onClick={onAddBar}
            disabled={!canAddBar}
            className="h-full min-h-[400px] w-12 bg-gold-500 text-white rounded hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

function Square({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}
