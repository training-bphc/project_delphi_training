-- Migration 002: Remove batches table, add verification_requests, add soft-delete to training_records

-- Step 1: Drop FK constraint from students to batches
ALTER TABLE students
DROP CONSTRAINT IF EXISTS students_batch_id_fkey;

-- Step 2: Drop batch_id column from students
ALTER TABLE students
DROP COLUMN IF EXISTS batch_id;

-- Step 3: Drop batch index
DROP INDEX IF EXISTS idx_students_batch;

-- Step 4: Drop batches table (no longer needed; batch is determined by start_year)
DROP TABLE IF EXISTS batches;

-- Step 5: Add deleted_at column to training_records for soft-delete undo functionality
ALTER TABLE training_records
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Step 6: Create verification_requests table for student-submitted verification requests
CREATE TABLE IF NOT EXISTS verification_requests (
  request_id      SERIAL PRIMARY KEY,
  student_id      INTEGER      NOT NULL,
  category        VARCHAR(100) NOT NULL,
  description     TEXT,
  proof_links     TEXT[]       NOT NULL DEFAULT '{}',
  status          VARCHAR(20)  NOT NULL DEFAULT 'Pending',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT vr_status_chk CHECK (status IN ('Pending', 'Verified', 'Rejected')),
  CONSTRAINT vr_student_fk FOREIGN KEY (student_id)
    REFERENCES students(student_id)
    ON DELETE CASCADE
);

-- Step 7: Create indices for verification_requests
CREATE INDEX IF NOT EXISTS idx_vr_student_id ON verification_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_vr_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_vr_created_at ON verification_requests(created_at);

-- Step 8: Create index on training_records deleted_at for efficient soft-delete queries
CREATE INDEX IF NOT EXISTS idx_training_records_deleted_at ON training_records(deleted_at);
