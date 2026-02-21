-- Batches must be created before students, because students has a FK to batches.
CREATE TABLE IF NOT EXISTS batches (
  batch_id    SERIAL PRIMARY KEY,
  batch_name  VARCHAR(100) NOT NULL,
  start_year  INTEGER      NOT NULL,
  end_year    INTEGER      NOT NULL
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  student_id   SERIAL PRIMARY KEY,
  email        VARCHAR(255) NOT NULL UNIQUE,
  student_name VARCHAR(255) NOT NULL,
  roll_number  VARCHAR(50)  NOT NULL UNIQUE,
  start_year   INTEGER      NOT NULL,
  end_year     INTEGER      NOT NULL,
  batch_id     INTEGER      NOT NULL REFERENCES batches(batch_id) ON DELETE RESTRICT,
  is_active    BOOLEAN      NOT NULL DEFAULT true
);

-- Admins
CREATE TABLE IF NOT EXISTS admins (
  admin_id       SERIAL PRIMARY KEY,
  email          VARCHAR(255) NOT NULL UNIQUE,
  admin_name     VARCHAR(255) NOT NULL,
  department     VARCHAR(100) NOT NULL,
  permissions    TEXT[]       NOT NULL DEFAULT '{}',
  is_super_admin BOOLEAN      NOT NULL DEFAULT false
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_batch ON students(batch_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- Training records table used by frontend overview and verification flow.
CREATE TABLE IF NOT EXISTS training_records (
  s_no                 SERIAL PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  bits_id              VARCHAR(30)  NOT NULL UNIQUE,
  email_id             VARCHAR(255) NOT NULL,
  date                 DATE         NOT NULL,
  category             VARCHAR(100) NOT NULL,
  added_by             VARCHAR(100) NOT NULL,
  verification_status  VARCHAR(20)  NOT NULL DEFAULT 'Pending',
  points               INTEGER      NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_training_records_status ON training_records(verification_status);
CREATE INDEX IF NOT EXISTS idx_training_records_bits_id ON training_records(bits_id);
