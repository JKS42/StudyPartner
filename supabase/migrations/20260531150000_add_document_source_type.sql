-- Allow Word documents as a note source type
ALTER TYPE source_type ADD VALUE IF NOT EXISTS 'document';
