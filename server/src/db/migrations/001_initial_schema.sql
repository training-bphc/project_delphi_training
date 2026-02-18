-- Students
CREATE TABLE IF NOT EXISTS students (
  student_id  SERIAL PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  full_name   VARCHAR(255) NOT NULL,
  roll_number VARCHAR(50)  NOT NULL UNIQUE,
  batch_id    INTEGER      NOT NULL REFERENCES batches(batch_id) ON DELETE RESTRICT,
  is_active   BOOLEAN      NOT NULL DEFAULT true
);

-- Admins
CREATE TABLE IF NOT EXISTS admins (
  admin_id       SERIAL PRIMARY KEY,
  email          VARCHAR(255) NOT NULL UNIQUE,
  full_name      VARCHAR(255) NOT NULL,
  department     VARCHAR(100) NOT NULL,
  permissions    TEXT[]       NOT NULL DEFAULT '{}',
  is_super_admin BOOLEAN      NOT NULL DEFAULT false
);

-- Other tables to be added...

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_batch        ON students(batch_id);
CREATE INDEX IF NOT EXISTS idx_students_email        ON students(email);