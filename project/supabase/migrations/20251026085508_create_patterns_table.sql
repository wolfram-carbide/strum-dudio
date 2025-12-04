/*
  # Create Drum Machine Patterns Table

  1. New Tables
    - `patterns`
      - `id` (uuid, primary key) - Unique pattern identifier
      - `user_id` (uuid, foreign key) - Links to auth.users
      - `song_name` (text) - User-defined song name
      - `bpm` (integer) - Beats per minute (60-200 range)
      - `kit_type` (text) - Drum kit selection (808, rock, jazz, trap, lofi)
      - `bars` (jsonb) - Array of bar objects containing pattern data
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last modification timestamp
  
  2. Security
    - Enable RLS on `patterns` table
    - Add policy for authenticated users to read their own patterns
    - Add policy for authenticated users to insert their own patterns
    - Add policy for authenticated users to update their own patterns
    - Add policy for authenticated users to delete their own patterns
  
  3. Indexes
    - Index on user_id for fast pattern retrieval by user
    - Index on created_at for sorting patterns
*/

CREATE TABLE IF NOT EXISTS patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  song_name text NOT NULL,
  bpm integer NOT NULL DEFAULT 120 CHECK (bpm >= 60 AND bpm <= 200),
  kit_type text NOT NULL DEFAULT '808',
  bars jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own patterns
CREATE POLICY "Users can read own patterns"
  ON patterns
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own patterns
CREATE POLICY "Users can insert own patterns"
  ON patterns
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own patterns
CREATE POLICY "Users can update own patterns"
  ON patterns
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own patterns
CREATE POLICY "Users can delete own patterns"
  ON patterns
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patterns_user_id ON patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_patterns_created_at ON patterns(created_at DESC);