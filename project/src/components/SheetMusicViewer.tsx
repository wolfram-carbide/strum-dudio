import { useMemo } from 'react';
import { Bar } from '../lib/supabase';
import { generateSheetMusicSVG } from '../lib/sheetMusicExport';

type SheetMusicViewerProps = {
  bars: Bar[];
  bpm: number;
  songName: string;
};

export function SheetMusicViewer({ bars, bpm, songName }: SheetMusicViewerProps) {
  const svgMarkup = useMemo(
    () => generateSheetMusicSVG(bars, bpm, songName || 'Untitled Pattern'),
    [bars, bpm, songName]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Sheet Music Preview</h2>
        <span className="text-xs text-gray-500">Updates instantly as you edit the pattern</span>
      </div>
      <div
        className="overflow-auto rounded-lg border border-gray-200 bg-white shadow-inner"
        role="img"
        aria-label="Sheet music for current pattern"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    </div>
  );
}
