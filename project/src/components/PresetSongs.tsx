import { useState } from 'react';
import { Library, Play } from 'lucide-react';

type PresetSong = {
  id: string;
  name: string;
  artist: string;
  description?: string;
};

type PresetPattern = {
  songName: string;
  artist?: string;
  bpm: number;
  kit: string;
  bars: any[];
  swing?: number;
  distortion?: any;
};

type PresetSongsProps = {
  onLoadPattern: (pattern: any) => void;
};

const PRESET_SONGS: PresetSong[] = [
  {
    id: 'californication',
    name: 'Californication',
    artist: 'Red Hot Chili Peppers',
    description: 'Classic rock groove with steady eighth note hi-hats'
  }
];

export function PresetSongs({ onLoadPattern }: PresetSongsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const loadPreset = async (preset: PresetSong) => {
    try {
      setLoading(preset.id);

      // Lazy load the JSON file using dynamic import
      const module = await import(`../data/presets/${preset.id}.json`);
      const data: PresetPattern = module.default;

      // Convert to the format expected by DrumMachine
      const pattern = {
        songName: data.songName,
        bpm: data.bpm,
        kit: data.kit,
        bars: data.bars,
        swing: data.swing || 0,
        distortion: data.distortion || { kick: false, snare: false, clap: false }
      };

      onLoadPattern(pattern);
      setIsOpen(false);
    } catch (error) {
      console.error('Error loading preset:', error);
      alert('Failed to load preset song. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 rounded transition-colors shadow-sm font-medium"
        title="Load a preset song pattern"
      >
        <Library size={16} />
        Preset Songs
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="absolute top-full right-0 mt-2 w-96 bg-tan-50 border-2 border-gold-400 rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="bg-gold-500 px-4 py-3 border-b-2 border-gold-600">
              <h3 className="font-bold text-navy-900 text-lg">Preset Songs</h3>
              <p className="text-sm text-navy-700 mt-0.5">Classic drum patterns ready to play</p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {PRESET_SONGS.length === 0 ? (
                <div className="p-6 text-center text-navy-600">
                  No preset songs available
                </div>
              ) : (
                <div className="divide-y divide-tan-200">
                  {PRESET_SONGS.map(preset => (
                    <div
                      key={preset.id}
                      className="p-4 hover:bg-gold-50 transition-colors cursor-pointer"
                      onClick={() => loadPreset(preset)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-gold-100 rounded-full">
                          <Play size={16} className="text-gold-700" />
                        </div>

                        <div className="flex-1">
                          <div className="font-bold text-navy-900 text-base">
                            {preset.name}
                          </div>
                          <div className="text-sm text-navy-700 font-medium mt-0.5">
                            {preset.artist}
                          </div>
                          {preset.description && (
                            <div className="text-xs text-navy-600 mt-1.5 leading-relaxed">
                              {preset.description}
                            </div>
                          )}
                        </div>

                        {loading === preset.id && (
                          <div className="text-xs text-navy-600 mt-1">
                            Loading...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
