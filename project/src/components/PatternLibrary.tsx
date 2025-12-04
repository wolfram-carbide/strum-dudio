import { useEffect, useState } from 'react';
import { Music, Trash2, Download } from 'lucide-react';
import { supabase, Pattern } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type PatternLibraryProps = {
  onLoadPattern: (pattern: Pattern) => void;
  currentSongName?: string;
};

export function PatternLibrary({ onLoadPattern, currentSongName }: PatternLibraryProps) {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadPatterns();
    } else {
      setPatterns([]);
      setLoading(false);
    }
  }, [user]);

  const loadPatterns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patterns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatterns(data || []);
    } catch (error) {
      console.error('Error loading patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePattern = async (id: string) => {
    if (!confirm('Delete this pattern?')) return;

    try {
      const { error } = await supabase
        .from('patterns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPatterns(patterns.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting pattern:', error);
      alert('Failed to delete pattern');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-navy-700 hover:bg-navy-800 text-white rounded transition-colors shadow-sm"
      >
        <Music size={16} />
        My Patterns ({patterns.length})
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-tan-50 border border-tan-300 rounded shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-navy-600">Loading...</div>
          ) : patterns.length === 0 ? (
            <div className="p-4 text-center text-navy-600">
              No saved patterns yet
            </div>
          ) : (
            <div className="divide-y divide-tan-200">
              {patterns.map(pattern => (
                <div
                  key={pattern.id}
                  className={`p-3 hover:bg-tan-100 transition-colors ${
                    pattern.song_name === currentSongName ? 'bg-gold-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => {
                        onLoadPattern(pattern);
                        setIsOpen(false);
                      }}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-navy-900">
                        {pattern.song_name}
                      </div>
                      <div className="text-xs text-navy-600 mt-1">
                        {pattern.bpm} BPM • {pattern.kit_type} • {pattern.bars.length} bars
                      </div>
                      <div className="text-xs text-navy-500 mt-1">
                        {new Date(pattern.created_at).toLocaleDateString()}
                      </div>
                    </button>

                    <button
                      onClick={() => deletePattern(pattern.id)}
                      className="p-1.5 rounded bg-navy-600 hover:bg-navy-700 text-white transition-colors"
                      title="Delete pattern"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
