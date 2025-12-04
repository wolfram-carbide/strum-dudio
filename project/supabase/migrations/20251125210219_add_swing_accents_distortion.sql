/*
  # Add Swing, Snare Accents, and Distortion Features

  1. Changes to `patterns` Table
    - Add `swing` column (integer, 0-75 range) - Swing percentage for triplet feel
    - Add `distortion` column (jsonb) - Per-drum distortion settings
    - Update `bars` structure to support snare accent arrays (handled in application layer)

  2. Migration Details
    - All columns are optional and have sensible defaults
    - Existing patterns will automatically have default values applied
    - No data loss occurs during migration
    - swing defaults to 0 (straight timing)
    - distortion defaults to all drums disabled

  3. Important Notes
    - snare_accent arrays are stored within the bars jsonb structure
    - This migration is backward compatible with existing patterns
    - All new columns use default values for existing records
*/

-- Add swing column (0-75 percentage)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patterns' AND column_name = 'swing'
  ) THEN
    ALTER TABLE patterns ADD COLUMN swing integer DEFAULT 0 CHECK (swing >= 0 AND swing <= 75);
  END IF;
END $$;

-- Add distortion column (jsonb for per-drum settings)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patterns' AND column_name = 'distortion'
  ) THEN
    ALTER TABLE patterns ADD COLUMN distortion jsonb DEFAULT '{"kick": false, "snare": false, "clap": false}'::jsonb;
  END IF;
END $$;