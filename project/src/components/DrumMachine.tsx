import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioEngine, DrumKit, DrumType } from '../lib/audioEngine';
import { Bar, DistortionSettings } from '../lib/supabase';
import { DrumGrid } from './DrumGrid';
import { Controls } from './Controls';
import { BarList } from './BarList';
import defaultPattern from '../data/Default_Marz-1761505345620.json';
import { downloadSheetMusicSVG } from '../lib/sheetMusicExport';

const DRUMS: DrumType[] = ['hihat', 'snare', 'kick', 'openhat', 'clap', 'tom', 'rim', 'cowbell'];
const BEATS_PER_BAR = 16;

export type PlaybackState = 'playing' | 'paused' | 'stopped';

type DrumMachineProps = {
  onSave: (bars: Bar[], bpm: number, kit: DrumKit, songName: string, swing: number, distortion: DistortionSettings) => void;
  initialBars?: Bar[];
  initialBpm?: number;
  initialKit?: DrumKit;
  initialSongName?: string;
  initialSwing?: number;
  initialDistortion?: DistortionSettings;
  isLoggedIn?: boolean;
};

export function DrumMachine({
  onSave,
  initialBars,
  initialBpm = 80,
  initialKit = 'jazz',
  initialSongName = '',
  initialSwing = 0,
  initialDistortion = { kick: false, snare: false, clap: false },
  isLoggedIn = false
}: DrumMachineProps) {
  const [bars, setBars] = useState<Bar[]>(() =>
    initialBars && initialBars.length > 0
      ? initialBars
      : (defaultPattern.bars as Bar[])
  );
  const [currentBar, setCurrentBar] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('stopped');
  const [bpm, setBpm] = useState(initialBpm);
  const [kit, setKit] = useState<DrumKit>(initialKit);
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const [copiedBar, setCopiedBar] = useState<Bar | null>(null);
  const [songName, setSongName] = useState(initialSongName);
  const [swing, setSwing] = useState(initialSwing);
  const [distortion, setDistortion] = useState<DistortionSettings>(initialDistortion);

  const audioEngineRef = useRef<AudioEngine | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const currentBarRef = useRef(0);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const userScrolledRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const lastAutoScrollRef = useRef(0);

  useEffect(() => {
    audioEngineRef.current = new AudioEngine();
  }, []);

  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setDistortion('kick', distortion.kick);
      audioEngineRef.current.setDistortion('snare', distortion.snare);
      audioEngineRef.current.setDistortion('clap', distortion.clap);
    }
  }, [distortion]);

  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastAutoScrollRef.current > 500) {
        userScrolledRef.current = true;
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = window.setTimeout(() => {
          userScrolledRef.current = false;
        }, 2000);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (event.code === 'Space' && !isInputField) {
        event.preventDefault();
        if (playbackState === 'playing') {
          handlePause();
        } else {
          handlePlay();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [playbackState]);

  const scheduleNote = useCallback((beatNumber: number, barNumber: number, time: number) => {
    const bar = bars[barNumber];
    if (!bar) return;

    DRUMS.forEach(drum => {
      if (bar[drum][beatNumber]) {
        let velocity = 1.0;
        if (drum === 'snare' && bar.snare_accent && bar.snare_accent[beatNumber]) {
          velocity = 1.7;
        }
        audioEngineRef.current?.playDrum(drum, kit, time, velocity);
      }
    });

    setCurrentBeat(beatNumber);
    setCurrentBar(barNumber);

    if (beatNumber === 0 && !userScrolledRef.current) {
      const container = gridContainerRef.current;
      const barElement = barRefs.current[barNumber];

      if (container && barElement) {
        lastAutoScrollRef.current = Date.now();
        barElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
      }
    }
  }, [bars, kit]);

  const scheduler = useCallback(() => {
    if (!audioEngineRef.current) return;

    const lookAhead = 0.1;
    const scheduleAheadTime = 0.2;
    const currentTime = audioEngineRef.current.getCurrentTime();

    while (nextNoteTimeRef.current < currentTime + scheduleAheadTime) {
      const secondsPerBeat = 60.0 / bpm / 4;
      const isOffBeat = currentBeatRef.current % 2 === 1;

      let swingDelay = 0;
      if (isOffBeat && swing > 0) {
        const swingRatio = swing / 100;
        const tripletTime = secondsPerBeat * (2 / 3);
        swingDelay = secondsPerBeat * swingRatio * 0.5;
      }

      scheduleNote(currentBeatRef.current, currentBarRef.current, nextNoteTimeRef.current + swingDelay);

      nextNoteTimeRef.current += secondsPerBeat;
      currentBeatRef.current++;

      if (currentBeatRef.current >= BEATS_PER_BAR) {
        currentBeatRef.current = 0;
        currentBarRef.current = (currentBarRef.current + 1) % bars.length;
      }
    }

    if (playbackState === 'playing') {
      schedulerRef.current = window.setTimeout(scheduler, lookAhead * 1000);
    }
  }, [bpm, bars, playbackState, scheduleNote, swing]);

  useEffect(() => {
    if (playbackState === 'playing') {
      if (audioEngineRef.current) {
        nextNoteTimeRef.current = audioEngineRef.current.getCurrentTime() + 0.005;
      }
      scheduler();
    } else if (schedulerRef.current) {
      clearTimeout(schedulerRef.current);
      schedulerRef.current = null;
    }

    return () => {
      if (schedulerRef.current) {
        clearTimeout(schedulerRef.current);
      }
    };
  }, [playbackState, scheduler]);

  const handlePlay = async () => {
    await audioEngineRef.current?.resume();
    if (playbackState === 'stopped') {
      setCurrentBar(0);
      setCurrentBeat(0);
      currentBarRef.current = 0;
      currentBeatRef.current = 0;
    } else {
      currentBarRef.current = currentBar;
      currentBeatRef.current = currentBeat;
    }
    setPlaybackState('playing');
  };

  const handlePause = () => {
    setPlaybackState('paused');
  };

  const handleStop = () => {
    setPlaybackState('stopped');
    setCurrentBar(0);
    setCurrentBeat(0);
    currentBarRef.current = 0;
    currentBeatRef.current = 0;
  };

  const toggleBeat = (barIndex: number, drum: DrumType, beat: number) => {
    setBars(bars => {
      const newBars = [...bars];
      newBars[barIndex] = {
        ...newBars[barIndex],
        [drum]: newBars[barIndex][drum].map((v, i) => i === beat ? !v : v)
      };
      return newBars;
    });
  };

  const toggleAccent = (barIndex: number, beat: number) => {
    setBars(bars => {
      const newBars = [...bars];
      const currentAccents = newBars[barIndex].snare_accent || Array(BEATS_PER_BAR).fill(false);
      const accentIsActive = currentAccents[beat];
      const snareIsActive = newBars[barIndex].snare[beat];

      if (accentIsActive) {
        newBars[barIndex] = {
          ...newBars[barIndex],
          snare_accent: currentAccents.map((v, i) => i === beat ? false : v)
        };
      } else {
        newBars[barIndex] = {
          ...newBars[barIndex],
          snare: snareIsActive ? newBars[barIndex].snare : newBars[barIndex].snare.map((v, i) => i === beat ? true : v),
          snare_accent: currentAccents.map((v, i) => i === beat ? true : v)
        };
      }
      return newBars;
    });
  };

  const addBar = () => {
    if (bars.length < 30) {
      setBars([...bars, createEmptyBar()]);
    }
  };

  const deleteBar = (index: number) => {
    if (bars.length > 1) {
      setBars(bars.filter((_, i) => i !== index));
      if (selectedBar === index) setSelectedBar(null);
      if (currentBar >= bars.length - 1) setCurrentBar(Math.max(0, bars.length - 2));
    }
  };

  const duplicateBar = (index: number) => {
    if (bars.length < 30) {
      const newBars = [...bars];
      newBars.splice(index + 1, 0, { ...bars[index] });
      setBars(newBars);
    }
  };

  const copyBar = (index: number) => {
    setCopiedBar({ ...bars[index] });
    setSelectedBar(index);
  };

  const pasteBar = (afterIndex: number) => {
    if (copiedBar && bars.length < 30) {
      const newBars = [...bars];
      newBars.splice(afterIndex + 1, 0, { ...copiedBar });
      setBars(newBars);
    }
  };

  const moveBar = (fromIndex: number, toIndex: number) => {
    const newBars = [...bars];
    const [movedBar] = newBars.splice(fromIndex, 1);
    newBars.splice(toIndex, 0, movedBar);
    setBars(newBars);
    if (currentBar === fromIndex) {
      setCurrentBar(toIndex);
    } else if (fromIndex < currentBar && toIndex >= currentBar) {
      setCurrentBar(currentBar - 1);
    } else if (fromIndex > currentBar && toIndex <= currentBar) {
      setCurrentBar(currentBar + 1);
    }
  };

  const clearBar = (index: number) => {
    setBars(bars => {
      const newBars = [...bars];
      newBars[index] = createEmptyBar();
      return newBars;
    });
  };

  const clearAll = () => {
    if (confirm('Clear all bars and reset to default pattern?')) {
      setBars(defaultPattern.bars as Bar[]);
      setBpm(80);
      setKit('jazz');
      setSongName('');
      setSwing(0);
      setDistortion({ kick: false, snare: false, clap: false });
      handleStop();
    }
  };

  const handleSave = () => {
    if (!songName.trim()) {
      alert('Please enter a song name');
      return;
    }
    onSave(bars, bpm, kit, songName, swing, distortion);
  };

  const handleExport = () => {
    const data = {
      songName: songName || 'Untitled Pattern',
      bpm,
      kit,
      bars,
      swing,
      distortion,
      exportedAt: new Date().toISOString(),
      version: '1.1'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${songName || 'pattern'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportSheetMusic = () => {
    downloadSheetMusicSVG(bars, bpm, songName || 'Untitled Pattern');
  };

  const handleImport = (data: { bars: Bar[]; bpm: number; kit: DrumKit; songName: string; swing?: number; distortion?: DistortionSettings }) => {
    setBars(data.bars);
    setBpm(data.bpm);
    setKit(data.kit);
    setSongName(data.songName);
    setSwing(data.swing || 0);
    setDistortion(data.distortion || { kick: false, snare: false, clap: false });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Controls
        playbackState={playbackState}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onClearAll={clearAll}
        bpm={bpm}
        onBpmChange={setBpm}
        kit={kit}
        onKitChange={setKit}
        songName={songName}
        onSongNameChange={setSongName}
        onExport={handleExport}
        onExportSheetMusic={handleExportSheetMusic}
        onImport={handleImport}
        onSave={handleSave}
        isLoggedIn={isLoggedIn}
        currentBar={currentBar}
        currentBeat={currentBeat}
        totalBars={bars.length}
        swing={swing}
        onSwingChange={setSwing}
        distortion={distortion}
        onDistortionChange={setDistortion}
      />

      <div ref={gridContainerRef} className="flex-1 overflow-x-auto overflow-y-hidden">
        <BarList
          bars={bars}
          currentBar={currentBar}
          currentBeat={currentBeat}
          playbackState={playbackState}
          selectedBar={selectedBar}
          onToggleBeat={toggleBeat}
          onToggleAccent={toggleAccent}
          onDeleteBar={deleteBar}
          onDuplicateBar={duplicateBar}
          onCopyBar={copyBar}
          onPasteBar={pasteBar}
          onMoveBar={moveBar}
          onClearBar={clearBar}
          onSelectBar={setSelectedBar}
          onAddBar={addBar}
          hasCopiedBar={copiedBar !== null}
          canAddBar={bars.length < 30}
          barRefs={barRefs}
        />
      </div>
    </div>
  );
}

function createEmptyBar(): Bar {
  return {
    kick: Array(BEATS_PER_BAR).fill(false),
    snare: Array(BEATS_PER_BAR).fill(false),
    hihat: Array(BEATS_PER_BAR).fill(false),
    openhat: Array(BEATS_PER_BAR).fill(false),
    clap: Array(BEATS_PER_BAR).fill(false),
    tom: Array(BEATS_PER_BAR).fill(false),
    rim: Array(BEATS_PER_BAR).fill(false),
    cowbell: Array(BEATS_PER_BAR).fill(false),
  };
}
