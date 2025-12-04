import { Download, Upload } from 'lucide-react';
import { Bar } from '../lib/supabase';
import { DrumKit } from '../lib/audioEngine';

type ImportExportProps = {
  bars: Bar[];
  bpm: number;
  kit: DrumKit;
  songName: string;
  onImport: (data: { bars: Bar[]; bpm: number; kit: DrumKit; songName: string }) => void;
};

export function ImportExport({ bars, bpm, kit, songName, onImport }: ImportExportProps) {
  const handleExport = () => {
    const data = {
      songName: songName || 'Untitled Pattern',
      bpm,
      kit,
      bars,
      exportedAt: new Date().toISOString(),
      version: '1.0'
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

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          kit: data.kit || '808',
          songName: data.songName || 'Imported Pattern'
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
    <div className="flex items-center gap-2">
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md"
        title="Export pattern as JSON"
      >
        <Download size={16} />
        Export
      </button>

      <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md cursor-pointer">
        <Upload size={16} />
        Import
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </label>
    </div>
  );
}
