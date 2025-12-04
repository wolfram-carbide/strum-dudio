import { Bar } from './supabase';
import { DrumType } from './audioEngine';

type DrumNotation = {
  drum: DrumType;
  label: string;
  staffLine: number;
  noteHead: string;
};

const DRUM_NOTATION: DrumNotation[] = [
  { drum: 'hihat', label: 'HH', staffLine: 0, noteHead: 'x' },
  { drum: 'snare', label: 'SD', staffLine: 2, noteHead: 'o' },
  { drum: 'kick', label: 'BD', staffLine: 4, noteHead: 'o' },
  { drum: 'openhat', label: 'OH', staffLine: 0.5, noteHead: 'o' },
  { drum: 'clap', label: 'CP', staffLine: 2, noteHead: 'x' },
  { drum: 'tom', label: 'TM', staffLine: 1, noteHead: 'o' },
  { drum: 'rim', label: 'RS', staffLine: 3, noteHead: 'x' },
  { drum: 'cowbell', label: 'CB', staffLine: 0, noteHead: 'triangle' },
];

export function generateSheetMusicSVG(
  bars: Bar[],
  bpm: number,
  songName: string
): string {
  const width = Math.max(1200, bars.length * 400);
  const height = 800;
  const margin = 40;
  const staffTop = 150;
  const staffSpacing = 20;
  const barWidth = (width - 2 * margin) / bars.length;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .staff-line { stroke: #333; stroke-width: 1; }
      .bar-line { stroke: #333; stroke-width: 2; }
      .note { fill: #333; }
      .note-x { stroke: #333; stroke-width: 2; fill: none; }
      .title { font-family: Georgia, serif; font-size: 24px; font-weight: bold; fill: #1a1a1a; }
      .tempo { font-family: Arial, sans-serif; font-size: 14px; fill: #333; }
      .legend { font-family: Arial, sans-serif; font-size: 12px; fill: #555; }
      .beat-number { font-family: Arial, sans-serif; font-size: 10px; fill: #666; }
    </style>
  </defs>

  <rect width="${width}" height="${height}" fill="#f5f1e8"/>
`;

  svg += `  <text x="${width / 2}" y="40" text-anchor="middle" class="title">${songName || 'Drum Pattern'}</text>\n`;
  svg += `  <text x="${width / 2}" y="70" text-anchor="middle" class="tempo">Tempo: ${bpm} BPM</text>\n`;

  for (let i = 0; i < 5; i++) {
    const y = staffTop + i * staffSpacing;
    svg += `  <line x1="${margin}" y1="${y}" x2="${width - margin}" y2="${y}" class="staff-line"/>\n`;
  }

  const legendY = staffTop + 5 * staffSpacing + 30;
  svg += `  <text x="${margin}" y="${legendY}" class="legend" font-weight="bold">Legend:</text>\n`;
  DRUM_NOTATION.forEach((notation, idx) => {
    const x = margin + 80 + (idx * 80);
    svg += `  <text x="${x}" y="${legendY}" class="legend">${notation.label} = ${notation.label === 'HH' ? 'Hi-Hat' : notation.label === 'SD' ? 'Snare' : notation.label === 'BD' ? 'Kick' : notation.label === 'OH' ? 'Open Hat' : notation.label === 'CP' ? 'Clap' : notation.label === 'TM' ? 'Tom' : notation.label === 'RS' ? 'Rim' : 'Cowbell'}</text>\n`;
  });

  bars.forEach((bar, barIndex) => {
    const barX = margin + barIndex * barWidth;

    svg += `  <line x1="${barX}" y1="${staffTop}" x2="${barX}" y2="${staffTop + 4 * staffSpacing}" class="bar-line"/>\n`;

    for (let beat = 0; beat < 16; beat++) {
      const beatX = barX + (beat + 0.5) * (barWidth / 16);

      if (beat % 4 === 0) {
        const beatNumber = beat + 1;
        svg += `  <text x="${beatX}" y="${staffTop - 10}" text-anchor="middle" class="beat-number">${beatNumber}</text>\n`;
      }

      DRUM_NOTATION.forEach((notation) => {
        if (bar[notation.drum][beat]) {
          const noteY = staffTop + notation.staffLine * staffSpacing;

          if (notation.noteHead === 'x') {
            const size = 6;
            svg += `  <line x1="${beatX - size}" y1="${noteY - size}" x2="${beatX + size}" y2="${noteY + size}" class="note-x"/>\n`;
            svg += `  <line x1="${beatX - size}" y1="${noteY + size}" x2="${beatX + size}" y2="${noteY - size}" class="note-x"/>\n`;
          } else if (notation.noteHead === 'triangle') {
            svg += `  <polygon points="${beatX},${noteY - 6} ${beatX - 5},${noteY + 4} ${beatX + 5},${noteY + 4}" class="note-x"/>\n`;
          } else {
            svg += `  <circle cx="${beatX}" cy="${noteY}" r="4" class="note"/>\n`;
          }

          svg += `  <line x1="${beatX}" y1="${noteY}" x2="${beatX}" y2="${staffTop + 4 * staffSpacing}" stroke="#333" stroke-width="1" opacity="0.3"/>\n`;
        }
      });
    }
  });

  svg += `  <line x1="${width - margin}" y1="${staffTop}" x2="${width - margin}" y2="${staffTop + 4 * staffSpacing}" class="bar-line"/>\n`;

  svg += '</svg>';
  return svg;
}

export function downloadSheetMusicSVG(bars: Bar[], bpm: number, songName: string): void {
  const svg = generateSheetMusicSVG(bars, bpm, songName);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${songName || 'pattern'}-sheet-music-${Date.now()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
