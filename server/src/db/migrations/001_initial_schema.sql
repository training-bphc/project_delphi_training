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
