ALTER TABLE hackathon_submissions
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
