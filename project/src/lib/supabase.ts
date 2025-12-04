import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Pattern = {
  id: string;
  user_id: string;
  song_name: string;
  bpm: number;
  kit_type: string;
  bars: Bar[];
  swing?: number;
  distortion?: DistortionSettings;
  created_at: string;
  updated_at: string;
};

export type DistortionSettings = {
  kick: boolean;
  snare: boolean;
  clap: boolean;
};

export type Bar = {
  kick: boolean[];
  snare: boolean[];
  snare_accent?: boolean[];
  hihat: boolean[];
  openhat: boolean[];
  clap: boolean[];
  tom: boolean[];
  rim: boolean[];
  cowbell: boolean[];
};
