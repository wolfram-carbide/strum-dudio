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
  songName: string,
  currentBar: number = 0,
  currentBeat: number = 0,
  playbackState: 'playing' | 'paused' | 'stopped' = 'stopped'
): string {
  const width = Math.max(1400, bars.length * 450);
  const height = 500;
  const leftMargin = 180; // Extra space for drum key/legend
  const rightMargin = 40;
  const staffTop = 120;
  const staffSpacing = 25;
  const staffWidth = width - leftMargin - rightMargin;
  const barWidth = staffWidth / bars.length;

  // Positions for clef and time signature
  const clefX = leftMargin - 60;
  const timeSignatureX = leftMargin - 30;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .staff-line { stroke: #1a1a1a; stroke-width: 1.5; }
      .bar-line { stroke: #1a1a1a; stroke-width: 3.5; }
      .double-bar-thin { stroke: #1a1a1a; stroke-width: 2; }
      .double-bar-thick { stroke: #1a1a1a; stroke-width: 5; }
      .bar-background-light { fill: rgba(255, 255, 255, 0.4); }
      .bar-background-dark { fill: rgba(220, 210, 190, 0.25); }
      .bar-number { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; fill: #555; }
      .note { fill: #000; }
      .note-stem { stroke: #000; stroke-width: 1.5; }
      .note-x { stroke: #000; stroke-width: 2.5; fill: none; }
      .title { font-family: Georgia, serif; font-size: 18px; font-weight: normal; fill: #333; }
      .tempo { font-family: Arial, sans-serif; font-size: 12px; fill: #555; font-style: italic; }
      .drum-key { font-family: Arial, sans-serif; font-size: 11px; fill: #444; }
      .drum-key-title { font-family: Arial, sans-serif; font-size: 12px; fill: #333; font-weight: bold; }
      .time-sig { font-family: Georgia, serif; font-size: 20px; font-weight: bold; fill: #1a1a1a; }
      .playback-indicator { stroke: #ef4444; stroke-width: 2.5; opacity: 0.8; }
    </style>
  </defs>

  <rect width="${width}" height="${height}" fill="#f5f1e8"/>
`;

  // Title and tempo in top left corner (more subtle)
  svg += `  <text x="20" y="30" class="title">${songName || 'Drum Pattern'}</text>\n`;
  svg += `  <text x="20" y="50" class="tempo">♩ = ${bpm}</text>\n`;

  // Draw staff lines
  for (let i = 0; i < 5; i++) {
    const y = staffTop + i * staffSpacing;
    svg += `  <line x1="${clefX - 10}" y1="${y}" x2="${width - rightMargin}" y2="${y}" class="staff-line"/>\n`;
  }

  // Draw percussion clef (two vertical parallel lines)
  const clefTop = staffTop;
  const clefBottom = staffTop + 4 * staffSpacing;
  svg += `  <line x1="${clefX}" y1="${clefTop}" x2="${clefX}" y2="${clefBottom}" stroke="#1a1a1a" stroke-width="3"/>\n`;
  svg += `  <line x1="${clefX + 8}" y1="${clefTop}" x2="${clefX + 8}" y2="${clefBottom}" stroke="#1a1a1a" stroke-width="3"/>\n`;

  // Draw time signature (4/4)
  const timeSigY = staffTop + 2 * staffSpacing;
  svg += `  <text x="${timeSignatureX}" y="${timeSigY - 10}" text-anchor="middle" class="time-sig">4</text>\n`;
  svg += `  <text x="${timeSignatureX}" y="${timeSigY + 22}" text-anchor="middle" class="time-sig">4</text>\n`;

  // Draw drum key (legend) on the left side
  const keyX = 20;
  const keyStartY = staffTop;
  svg += `  <text x="${keyX}" y="${keyStartY}" class="drum-key-title">Drum Key:</text>\n`;

  const legendItems = [
    { label: 'HH', name: 'Hi-Hat' },
    { label: 'OH', name: 'Open Hat' },
    { label: 'TM', name: 'Tom' },
    { label: 'SD', name: 'Snare' },
    { label: 'CP', name: 'Clap' },
    { label: 'RS', name: 'Rim' },
    { label: 'BD', name: 'Kick' },
    { label: 'CB', name: 'Cowbell' },
  ];

  legendItems.forEach((item, idx) => {
    const y = keyStartY + 20 + (idx * 16);
    svg += `  <text x="${keyX}" y="${y}" class="drum-key">${item.label} - ${item.name}</text>\n`;
  });

  // Draw bars and notes
  bars.forEach((bar, barIndex) => {
    const barX = leftMargin + barIndex * barWidth;

    // Add alternating background for each bar
    const nextBarX = leftMargin + (barIndex + 1) * barWidth;
    const bgClass = barIndex % 2 === 0 ? 'bar-background-light' : 'bar-background-dark';
    svg += `  <rect x="${barX}" y="${staffTop - 30}" width="${barWidth}" height="${4 * staffSpacing + 40}" class="${bgClass}"/>\n`;

    // Add bar number above the staff
    const barNumberX = barX + barWidth / 2;
    svg += `  <text x="${barNumberX}" y="${staffTop - 10}" text-anchor="middle" class="bar-number">${barIndex + 1}</text>\n`;

    svg += `  <line x1="${barX}" y1="${staffTop}" x2="${barX}" y2="${staffTop + 4 * staffSpacing}" class="bar-line"/>\n`;

    for (let beat = 0; beat < 16; beat++) {
      const beatX = barX + (beat + 0.5) * (barWidth / 16);

      DRUM_NOTATION.forEach((notation) => {
        if (bar[notation.drum][beat]) {
          const noteY = staffTop + notation.staffLine * staffSpacing;

          if (notation.noteHead === 'x') {
            // Improved X notehead for hi-hat and similar
            const size = 7;
            svg += `  <line x1="${beatX - size}" y1="${noteY - size}" x2="${beatX + size}" y2="${noteY + size}" class="note-x"/>\n`;
            svg += `  <line x1="${beatX - size}" y1="${noteY + size}" x2="${beatX + size}" y2="${noteY - size}" class="note-x"/>\n`;
            // Add stem going up
            const stemTop = staffTop - 20;
            svg += `  <line x1="${beatX}" y1="${noteY}" x2="${beatX}" y2="${stemTop}" class="note-stem"/>\n`;
          } else if (notation.noteHead === 'triangle') {
            // Triangle for cowbell
            svg += `  <polygon points="${beatX},${noteY - 7} ${beatX - 6},${noteY + 5} ${beatX + 6},${noteY + 5}" class="note-x"/>\n`;
            // Add stem
            const stemTop = staffTop - 20;
            svg += `  <line x1="${beatX}" y1="${noteY - 7}" x2="${beatX}" y2="${stemTop}" class="note-stem"/>\n`;
          } else {
            // Regular filled notehead - larger and more visible
            svg += `  <ellipse cx="${beatX}" cy="${noteY}" rx="5" ry="4" class="note"/>\n`;
            // Add stem going up
            const stemTop = staffTop - 20;
            svg += `  <line x1="${beatX + 5}" y1="${noteY}" x2="${beatX + 5}" y2="${stemTop}" class="note-stem"/>\n`;
          }
        }
      });
    }
  });

  // Draw double bar line at the end (thin + thick)
  const endX = width - rightMargin;
  svg += `  <line x1="${endX - 6}" y1="${staffTop}" x2="${endX - 6}" y2="${staffTop + 4 * staffSpacing}" class="double-bar-thin"/>\n`;
  svg += `  <line x1="${endX}" y1="${staffTop}" x2="${endX}" y2="${staffTop + 4 * staffSpacing}" class="double-bar-thick"/>\n`;

  // Add playback position indicator
  if (playbackState === 'playing' && currentBar < bars.length) {
    const barX = leftMargin + currentBar * barWidth;
    const beatX = barX + (currentBeat + 0.5) * (barWidth / 16);
    const indicatorTop = staffTop - 20;
    const indicatorBottom = staffTop + 4 * staffSpacing + 10;

    svg += `  <line x1="${beatX}" y1="${indicatorTop}" x2="${beatX}" y2="${indicatorBottom}" class="playback-indicator"/>\n`;
    // Add a small circle at the top for better visibility
    svg += `  <circle cx="${beatX}" cy="${indicatorTop - 5}" r="4" fill="#ef4444" opacity="0.8"/>\n`;
  }

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
