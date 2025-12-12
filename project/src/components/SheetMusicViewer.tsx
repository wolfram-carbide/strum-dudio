import { useMemo, useRef, useEffect } from 'react';
import { Bar } from '../lib/supabase';
import { generateSheetMusicSVG } from '../lib/sheetMusicExport';

type SheetMusicViewerProps = {
  bars: Bar[];
  bpm: number;
  songName: string;
  currentBar?: number;
  currentBeat?: number;
  playbackState?: 'playing' | 'paused' | 'stopped';
};

export function SheetMusicViewer({
  bars,
  bpm,
  songName,
  currentBar = 0,
  currentBeat = 0,
  playbackState = 'stopped'
}: SheetMusicViewerProps) {
  const svgMarkup = useMemo(
    () => generateSheetMusicSVG(bars, bpm, songName || 'Untitled Pattern', currentBar, currentBeat, playbackState),
    [bars, bpm, songName, currentBar, currentBeat, playbackState]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle manual scrolling detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      userScrolledRef.current = true;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        userScrolledRef.current = false;
      }, 2000);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll to current bar during playback
  useEffect(() => {
    if (playbackState !== 'playing' || userScrolledRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    // Calculate the position based on current bar
    const margin = 40;
    const barWidth = Math.max(1200, bars.length * 400) / bars.length - (2 * margin / bars.length);
    const scrollPosition = margin + currentBar * barWidth - container.clientWidth / 2 + barWidth / 2;

    container.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: 'smooth'
    });
  }, [currentBar, playbackState, bars.length]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Sheet Music Preview</h2>
        <span className="text-xs text-gray-500">
          {playbackState === 'playing' ? 'Following playback...' : 'Updates instantly as you edit the pattern'}
        </span>
      </div>
      <div
        ref={containerRef}
        className="overflow-auto rounded-lg border border-gray-200 bg-white shadow-inner"
        style={{ maxHeight: '300px' }}
        role="img"
        aria-label="Sheet music for current pattern"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    </div>
  );
}
