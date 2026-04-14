-- Consolidated baseline schema for Project Delphi.

-- Create ENUM type for sector
DO $$ BEGIN
  CREATE TYPE sector_enum AS ENUM ('IT', 'ET', 'Core', 'FinTech');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Students
CREATE TABLE IF NOT EXISTS students (
  student_id   SERIAL PRIMARY KEY,
  email        VARCHAR(255) NOT NULL UNIQUE,
  student_name VARCHAR(255) NOT NULL,
  roll_number  VARCHAR(50)  NOT NULL UNIQUE,
  start_year   INTEGER      NOT NULL,
  end_year     INTEGER      NOT NULL,
  cgpa         NUMERIC(4, 2) NOT NULL,
  sector       sector_enum  NOT NULL,
  CONSTRAINT students_year_order_chk CHECK (start_year <= end_year),
  CONSTRAINT students_roll_email_uk UNIQUE (roll_number, email)
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

-- Indexes for students table
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_sector ON students(sector);
CREATE INDEX IF NOT EXISTS idx_students_cgpa ON students(cgpa);

-- Training point categories are now the single source of truth.
CREATE TABLE IF NOT EXISTS training_point_categories (
  category_id    SERIAL PRIMARY KEY,
  category_name  VARCHAR(100) NOT NULL UNIQUE,
  description    TEXT,
  max_points     INTEGER      NOT NULL DEFAULT 0,
  is_mythology   BOOLEAN      NOT NULL DEFAULT false,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT training_point_categories_max_points_chk CHECK (max_points >= 0)
);

CREATE INDEX IF NOT EXISTS idx_training_point_categories_name
  ON training_point_categories(category_name);

-- Training points table used by frontend overview and verification flow.
CREATE TABLE IF NOT EXISTS training_points (
  s_no                 SERIAL PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  bits_id              VARCHAR(30)  NOT NULL,
  email_id             VARCHAR(255) NOT NULL,
  date                 DATE         NOT NULL,
  category_id          INTEGER      NOT NULL,
  added_by             VARCHAR(100) NOT NULL,
  verification_status  VARCHAR(20)  NOT NULL DEFAULT 'Pending',
  points               INTEGER      NOT NULL DEFAULT 0,
  deleted_at           TIMESTAMP,
  awarded_by           VARCHAR(255),
  CONSTRAINT training_records_status_chk CHECK (verification_status IN ('Pending', 'Verified', 'Rejected')),
  CONSTRAINT training_points_category_fk FOREIGN KEY (category_id)
    REFERENCES training_point_categories(category_id)
    ON DELETE RESTRICT,
  CONSTRAINT training_records_student_fk FOREIGN KEY (bits_id, email_id)
    REFERENCES students(roll_number, email)
    ON DELETE RESTRICT,
  CONSTRAINT training_points_awarded_by_fk FOREIGN KEY (awarded_by)
    REFERENCES admins(email)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_training_points_status ON training_points(verification_status);
CREATE INDEX IF NOT EXISTS idx_training_points_bits_id ON training_points(bits_id);
CREATE INDEX IF NOT EXISTS idx_training_points_deleted_at ON training_points(deleted_at);

-- Hackathon submissions are equivalent to verification requests.
CREATE TABLE IF NOT EXISTS hackathon_submissions (
  request_id      SERIAL PRIMARY KEY,
  student_id      INTEGER      NOT NULL,
  category_id     INTEGER      NOT NULL,
  description     TEXT,
  proof_links     TEXT[]       NOT NULL DEFAULT '{}',
  status          VARCHAR(20)  NOT NULL DEFAULT 'Pending',
  awarded_by      VARCHAR(255),
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT hs_status_chk CHECK (status IN ('Pending', 'Verified', 'Rejected')),
  CONSTRAINT hs_student_fk FOREIGN KEY (student_id)
    REFERENCES students(student_id)
    ON DELETE CASCADE,
  CONSTRAINT hs_category_fk FOREIGN KEY (category_id)
    REFERENCES training_point_categories(category_id)
    ON DELETE RESTRICT,
  CONSTRAINT hs_awarded_by_fk FOREIGN KEY (awarded_by)
    REFERENCES admins(email)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_hs_student_id ON hackathon_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_hs_status ON hackathon_submissions(status);
CREATE INDEX IF NOT EXISTS idx_hs_created_at ON hackathon_submissions(created_at);

INSERT INTO training_point_categories (category_name, description, max_points, is_mythology)
VALUES
  ('Sectorial Briefs', 'Sector-focused training briefs', 8, false),
  ('Mock Assessments', 'Practice assessments for readiness', 8, false),
  ('Mock Interviews', 'Interview simulation sessions', 12, false),
  ('Mini Assessments', 'Short formative assessments', 2, false),
  ('NT-Excel', 'NT Excel module completion', 3, false),
  ('NT-SQL', 'NT SQL module completion', 3, false),
  ('NT-Python', 'NT Python module completion', 5, false),
  ('Guest Lectures / Workshops', 'Verified external/internal workshop participation', 10, false),
  ('Hackathons/Competitions', 'Hackathon and competition participation', 10, false),
  ('Bonus Points', 'Additional points awarded under approved policy', 15, false)
ON CONFLICT (category_name) DO NOTHING;
