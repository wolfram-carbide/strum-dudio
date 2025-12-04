import { Play, Pause, Square, Download, Upload, RotateCcw, Music, Zap } from 'lucide-react';
import { DrumKit } from '../lib/audioEngine';
import { PlaybackState } from './DrumMachine';
import { Bar, DistortionSettings } from '../lib/supabase';

type ControlsProps = {
  playbackState: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onClearAll: () => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  kit: DrumKit;
  onKitChange: (kit: DrumKit) => void;
  songName: string;
  onSongNameChange: (name: string) => void;
  onExport: () => void;
  onExportSheetMusic: () => void;
  onImport: (data: { bars: Bar[]; bpm: number; kit: DrumKit; songName: string; swing?: number; distortion?: DistortionSettings }) => void;
  onSave: () => void;
  isLoggedIn: boolean;
  currentBar: number;
  currentBeat: number;
  totalBars: number;
  swing: number;
  onSwingChange: (swing: number) => void;
  distortion: DistortionSettings;
  onDistortionChange: (distortion: DistortionSettings) => void;
};

const KIT_OPTIONS: { value: DrumKit; label: string }[] = [
  { value: '808', label: 'Vintage 808' },
  { value: 'rock', label: 'Acoustic Rock' },
  { value: 'jazz', label: 'Jazz Brush' },
  { value: 'trap', label: 'Trap/Hip-Hop' },
  { value: 'lofi', label: 'Lo-Fi' },
  { value: 'electro', label: 'Electro' },
  { value: 'vintage', label: 'Vintage Ludwig' },
  { value: 'house', label: 'House 4/4' },
  { value: 'dnb', label: 'Drum & Bass' },
  { value: 'techno', label: 'Techno' },
];

const SWING_PRESETS = [
  { label: 'Straight', value: 0 },
  { label: 'Light', value: 25 },
  { label: 'Medium', value: 50 },
  { label: 'Heavy', value: 66 },
  { label: 'Shuffle', value: 75 },
];

export function Controls({
  playbackState,
  onPlay,
  onPause,
  onStop,
  onClearAll,
  bpm,
  onBpmChange,
  kit,
  onKitChange,
  songName,
  onSongNameChange,
  onExport,
  onExportSheetMusic,
  onImport,
  onSave,
  isLoggedIn,
  currentBar,
  currentBeat,
  totalBars,
  swing,
  onSwingChange,
  distortion,
  onDistortionChange
}: ControlsProps) {
  const isPlaying = playbackState === 'playing';

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.bars || !Array.isArray(data.bars)) {
          alert('Invalid pattern file format');
          return;
        }

        onImport({
          bars: data.bars,
          bpm: data.bpm || 120,
          kit: data.kit || 'jazz',
          songName: data.songName || 'Imported Pattern',
          swing: data.swing || 0,
          distortion: data.distortion || { kick: false, snare: false, clap: false }
        });

        alert('Pattern imported successfully!');
      } catch (error) {
        console.error('Error importing pattern:', error);
        alert('Failed to import pattern. Please check the file format.');
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="bg-tan-50 border-b border-tan-300 p-4 space-y-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className={`
              h-10 px-4 rounded transition-all duration-200 flex items-center justify-center
              ${isPlaying
                ? 'bg-gold-500 hover:bg-gold-600'
                : 'bg-gold-500 hover:bg-gold-600'
              }
              text-white shadow-sm
            `}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={onStop}
            className="h-10 px-4 rounded bg-navy-800 hover:bg-navy-900 text-white shadow-sm transition-all flex items-center justify-center"
          >
            <Square size={20} />
          </button>

          <button
            onClick={onClearAll}
            className="h-10 px-4 rounded bg-navy-700 hover:bg-navy-800 text-white shadow-sm transition-all flex items-center justify-center gap-2"
            title="Clear all and reset"
          >
            <RotateCcw size={16} />
            Clear All
          </button>

          <div className="h-10 text-navy-800 text-sm bg-tan-300 px-4 rounded border border-gold-400 flex items-center">
            Bar {currentBar + 1}/{totalBars} • Beat {currentBeat + 1}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="h-10 flex items-center gap-2 bg-tan-300 px-4 rounded border border-tan-400">
            <label htmlFor="bpm" className="text-sm font-medium text-navy-800">
              Tempo:
            </label>
            <input
              id="bpm"
              type="number"
              min="60"
              max="200"
              value={bpm}
              onChange={(e) => onBpmChange(Number(e.target.value))}
              className="w-16 px-2 py-1 border border-tan-400 rounded bg-white text-navy-900 font-medium focus:outline-none focus:border-gold-500"
            />
            <span className="text-sm font-medium text-navy-800">BPM</span>
          </div>

          <select
            id="kit"
            value={kit}
            onChange={(e) => onKitChange(e.target.value as DrumKit)}
            className="h-10 px-4 border border-tan-400 rounded bg-tan-300 text-navy-900 font-medium focus:outline-none focus:border-gold-500"
          >
            {KIT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="h-10 flex items-center gap-2 bg-tan-300 px-3 rounded border border-tan-400 flex-shrink-0">
          <label className="text-sm font-medium text-navy-800 whitespace-nowrap">Swing:</label>
          <input
            type="range"
            min="0"
            max="75"
            value={swing}
            onChange={(e) => onSwingChange(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm font-medium text-navy-800 w-8 text-center">{swing}%</span>
        </div>

        <div className="flex items-center gap-2">
          {SWING_PRESETS.map(preset => (
            <button
              key={preset.value}
              onClick={() => onSwingChange(preset.value)}
              className={`h-10 px-3 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                swing === preset.value
                  ? 'bg-gold-500 text-white'
                  : 'bg-tan-200 text-navy-700 hover:bg-tan-400'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="h-10 flex items-center gap-2 bg-tan-300 px-3 rounded border border-tan-400">
          <Zap size={16} className="text-gold-600" />
          <span className="text-sm font-medium text-navy-800">FX:</span>
          {(['kick', 'snare', 'clap'] as const).map(drum => (
            <button
              key={drum}
              onClick={() => onDistortionChange({ ...distortion, [drum]: !distortion[drum] })}
              className={`px-2 py-1 text-xs rounded transition-all font-medium ${
                distortion[drum]
                  ? 'bg-gold-500 text-white shadow-sm'
                  : 'bg-tan-200 text-navy-700 hover:bg-tan-400'
              }`}
            >
              {drum.charAt(0).toUpperCase() + drum.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          value={songName}
          onChange={(e) => onSongNameChange(e.target.value)}
          placeholder="Song name..."
          className="flex-1 h-10 px-4 border border-tan-400 rounded bg-white text-navy-900 placeholder-navy-400 focus:outline-none focus:border-gold-500"
        />
        <button
          onClick={onExport}
          className="h-10 flex items-center gap-2 px-6 bg-navy-700 text-white rounded hover:bg-navy-800 font-medium shadow-sm transition-all"
        >
          <Download size={16} />
          Export JSON
        </button>
        <button
          onClick={onExportSheetMusic}
          className="h-10 flex items-center gap-2 px-6 bg-navy-700 text-white rounded hover:bg-navy-800 font-medium shadow-sm transition-all"
        >
          <Music size={16} />
          Export Sheet Music
        </button>
        <label className="h-10 flex items-center gap-2 px-6 bg-navy-700 hover:bg-navy-800 text-white rounded font-medium shadow-sm transition-all cursor-pointer">
          <Upload size={16} />
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </label>
        {isLoggedIn && (
          <button
            onClick={onSave}
            className="h-10 px-6 bg-gold-500 text-white rounded hover:bg-gold-600 font-medium shadow-sm transition-all"
          >
            Save to Cloud
          </button>
        )}
      </div>
    </div>
  );
}
