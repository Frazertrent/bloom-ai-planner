-- Add avatar_url column to bf_students table for seller avatars
ALTER TABLE bf_students ADD COLUMN IF NOT EXISTS avatar_url TEXT;