-- Events tracking schema

CREATE TABLE IF NOT EXISTS events (
  event_id     SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  event_type   VARCHAR(100) NOT NULL,
  event_date   DATE NOT NULL,
  venue        VARCHAR(255) NOT NULL,
  url          TEXT,
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  created_by   VARCHAR(255) NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at   TIMESTAMP,
  CONSTRAINT events_created_by_fk
    FOREIGN KEY (created_by)
    REFERENCES admins(email)
    ON DELETE RESTRICT,
  CONSTRAINT events_url_chk
    CHECK (url IS NULL OR url ~* '^https?://')
);

CREATE INDEX IF NOT EXISTS idx_events_event_date
  ON events(event_date);

CREATE INDEX IF NOT EXISTS idx_events_created_by
  ON events(created_by);

CREATE INDEX IF NOT EXISTS idx_events_deleted_at
  ON events(deleted_at);

CREATE TABLE IF NOT EXISTS event_registrations (
  registration_id SERIAL PRIMARY KEY,
  event_id        INTEGER NOT NULL,
  student_id      INTEGER NOT NULL,
  is_registered   BOOLEAN NOT NULL DEFAULT false,
  has_attended    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP,
  CONSTRAINT event_registrations_event_fk
    FOREIGN KEY (event_id)
    REFERENCES events(event_id)
    ON DELETE CASCADE,
  CONSTRAINT event_registrations_student_fk
    FOREIGN KEY (student_id)
    REFERENCES students(student_id)
    ON DELETE CASCADE,
  CONSTRAINT event_registrations_attendance_chk
    CHECK (NOT has_attended OR is_registered),
  CONSTRAINT event_registrations_unique_event_student_uk
    UNIQUE (event_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id
  ON event_registrations(event_id);

CREATE INDEX IF NOT EXISTS idx_event_registrations_student_id
  ON event_registrations(student_id);

CREATE INDEX IF NOT EXISTS idx_event_registrations_deleted_at
  ON event_registrations(deleted_at);
