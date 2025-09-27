-- Update proposals table to ensure it matches the current builder features
-- This ensures all builder fields are properly stored

-- First add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add columns that might be missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'proposals' AND column_name = 'confetti_style') THEN
        ALTER TABLE proposals ADD COLUMN confetti_style text DEFAULT 'hearts';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'proposals' AND column_name = 'custom_ending_message') THEN
        ALTER TABLE proposals ADD COLUMN custom_ending_message text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'proposals' AND column_name = 'voice_note_url') THEN
        ALTER TABLE proposals ADD COLUMN voice_note_url text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'proposals' AND column_name = 'countdown_date') THEN
        ALTER TABLE proposals ADD COLUMN countdown_date timestamp with time zone;
    END IF;
END $$;