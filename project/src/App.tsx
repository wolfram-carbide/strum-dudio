import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DrumMachine } from './components/DrumMachine';
import { AuthButton } from './components/AuthButton';
import { PatternLibrary } from './components/PatternLibrary';
import { PresetSongs } from './components/PresetSongs';
import { supabase, Pattern, Bar, DistortionSettings } from './lib/supabase';
import { DrumKit } from './lib/audioEngine';
import defaultPattern from './data/22Nov_1st_2bars-1763833511838.json';

function AppContent() {
  const { user } = useAuth();
  const [currentPattern, setCurrentPattern] = useState<Pattern | null>(() => ({
    id: '',
    user_id: '',
    song_name: defaultPattern.songName,
    bpm: defaultPattern.bpm,
    kit_type: defaultPattern.kit as DrumKit,
    bars: defaultPattern.bars,
    swing: 0,
    distortion: { kick: false, snare: false, clap: false },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  const [key, setKey] = useState(0);

  const handleSave = async (bars: Bar[], bpm: number, kit: DrumKit, songName: string, swing: number, distortion: DistortionSettings) => {
    if (!user) {
      alert('Please sign in to save patterns');
      return;
    }

    try {
      const patternData = {
        user_id: user.id,
        song_name: songName,
        bpm,
        kit_type: kit,
        bars,
        swing,
        distortion,
        updated_at: new Date().toISOString()
      };

      if (currentPattern) {
        const { error } = await supabase
          .from('patterns')
          .update(patternData)
          .eq('id', currentPattern.id);

        if (error) throw error;
        alert('Pattern updated successfully!');
      } else {
        const { error } = await supabase
          .from('patterns')
          .insert([patternData]);

        if (error) throw error;
        alert('Pattern saved successfully!');
      }
    } catch (error) {
      console.error('Error saving pattern:', error);
      alert('Failed to save pattern');
    }
  };

  const handleLoadPattern = (pattern: Pattern) => {
    setCurrentPattern(pattern);
    setKey(prev => prev + 1);
  };

  const handleNewPattern = () => {
    setCurrentPattern(null);
    setKey(prev => prev + 1);
  };

  const handleImport = (data: { bars: Bar[]; bpm: number; kit: DrumKit; songName: string; swing?: number; distortion?: DistortionSettings }) => {
    setCurrentPattern({
      id: '',
      user_id: '',
      song_name: data.songName,
      bpm: data.bpm,
      kit_type: data.kit,
      bars: data.bars,
      swing: data.swing || 0,
      distortion: data.distortion || { kick: false, snare: false, clap: false },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-tan-200 flex flex-col">
      <div className="film-grain" />

      <header className="bg-tan-50 text-navy-900 p-6 shadow-sm border-b border-tan-300">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-wide uppercase" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.15em' }}>
              Strum Dudio
            </h1>
            <p className="text-sm text-navy-600 mt-1">Create beats, export to your system, Practice well!</p>
          </div>

          <div className="flex items-center gap-3">
            <PresetSongs onLoadPattern={handleImport} />
            {user && (
              <>
                <button
                  onClick={handleNewPattern}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded transition-colors shadow-sm font-medium"
                >
                  New Pattern
                </button>
                <PatternLibrary
                  onLoadPattern={handleLoadPattern}
                  currentSongName={currentPattern?.song_name}
                />
              </>
            )}
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full p-4">
        <DrumMachine
          key={key}
          onSave={handleSave}
          initialBars={currentPattern?.bars}
          initialBpm={currentPattern?.bpm}
          initialKit={currentPattern?.kit_type as DrumKit}
          initialSongName={currentPattern?.song_name}
          initialSwing={currentPattern?.swing}
          initialDistortion={currentPattern?.distortion}
          isLoggedIn={!!user}
        />
      </main>

      <footer className="bg-navy-800 text-tan-200 p-4 text-center text-sm border-t border-navy-900">
        <p>Strum Dudio</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
