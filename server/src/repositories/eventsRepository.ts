import pool from "../config/db";
import {
  CreateEventInput,
  Event,
  EventRegistration,
  EventRegistrationWithStudent,
  StudentEventStatus,
  UpdateEventInput,
} from "../types";

const EVENT_SELECT = `
  SELECT
    e.event_id,
    e.title,
    e.event_type,
    e.event_date::text AS event_date,
    e.venue,
    e.url,
    e.is_mandatory,
    e.created_by,
    e.created_at::text AS created_at,
    e.updated_at::text AS updated_at,
    e.deleted_at::text AS deleted_at
  FROM events e
`;

export const findAllEvents = async (): Promise<Event[]> => {
  const result = await pool.query<Event>(
    `${EVENT_SELECT}
     WHERE e.deleted_at IS NULL
     ORDER BY e.event_date ASC, e.event_id ASC`,
  );
  return result.rows;
};

export const findEventById = async (
  eventId: number,
  includeDeleted = false,
): Promise<Event | null> => {
  const result = await pool.query<Event>(
    `${EVENT_SELECT}
     WHERE e.event_id = $1 ${includeDeleted ? "" : "AND e.deleted_at IS NULL"}
     LIMIT 1`,
    [eventId],
  );
  return result.rows[0] ?? null;
};

export const createEvent = async (
  payload: CreateEventInput,
  createdBy: string,
): Promise<Event> => {
  const result = await pool.query<Event>(
    `
      INSERT INTO events (
        title,
        event_type,
        event_date,
        venue,
        url,
        is_mandatory,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        event_id,
        title,
        event_type,
        event_date::text AS event_date,
        venue,
        url,
        is_mandatory,
        created_by,
        created_at::text AS created_at,
        updated_at::text AS updated_at,
        deleted_at::text AS deleted_at
    `,
    [
      payload.title,
      payload.event_type,
      payload.event_date,
      payload.venue,
      payload.url ?? null,
      payload.is_mandatory ?? false,
      createdBy,
    ],
  );

  return result.rows[0];
};

export const updateEvent = async (
  eventId: number,
  payload: UpdateEventInput,
): Promise<Event | null> => {
  const setParts: string[] = [];
  const values: Array<string | boolean | null> = [];

  if (payload.title !== undefined) {
    values.push(payload.title);
    setParts.push(`title = $${values.length}`);
  }

  if (payload.event_type !== undefined) {
    values.push(payload.event_type);
    setParts.push(`event_type = $${values.length}`);
  }

  if (payload.event_date !== undefined) {
    values.push(payload.event_date);
    setParts.push(`event_date = $${values.length}`);
  }

  if (payload.venue !== undefined) {
    values.push(payload.venue);
    setParts.push(`venue = $${values.length}`);
  }

  if (payload.url !== undefined) {
    values.push(payload.url);
    setParts.push(`url = $${values.length}`);
  }

  if (payload.is_mandatory !== undefined) {
    values.push(payload.is_mandatory);
    setParts.push(`is_mandatory = $${values.length}`);
  }

  if (setParts.length === 0) {
    return null;
  }

  const result = await pool.query<Event>(
    `
      UPDATE events
      SET ${setParts.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE event_id = $${values.length + 1} AND deleted_at IS NULL
      RETURNING
        event_id,
        title,
        event_type,
        event_date::text AS event_date,
        venue,
        url,
        is_mandatory,
        created_by,
        created_at::text AS created_at,
        updated_at::text AS updated_at,
        deleted_at::text AS deleted_at
    `,
    [...values, eventId],
  );

  return result.rows[0] ?? null;
};

export const softDeleteEvent = async (eventId: number): Promise<boolean> => {
  const result = await pool.query(
    `
      UPDATE events
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE event_id = $1 AND deleted_at IS NULL
    `,
    [eventId],
  );

  return (result.rowCount ?? 0) > 0;
};

export const findEventsForStudent = async (
  studentEmail: string,
): Promise<StudentEventStatus[]> => {
  const result = await pool.query<StudentEventStatus>(
    `
      SELECT
        e.event_id,
        e.title,
        e.event_type,
        e.event_date::text AS event_date,
        e.venue,
        e.url,
        e.is_mandatory,
        e.created_by,
        e.created_at::text AS created_at,
        e.updated_at::text AS updated_at,
        e.deleted_at::text AS deleted_at,
        er.registration_id,
        er.is_registered,
        er.has_attended,
        er.created_at::text AS registration_created_at,
        er.updated_at::text AS registration_updated_at,
        er.deleted_at::text AS registration_deleted_at
      FROM students s
      JOIN events e ON e.deleted_at IS NULL
      LEFT JOIN event_registrations er
        ON er.event_id = e.event_id
       AND er.student_id = s.student_id
       AND er.deleted_at IS NULL
      WHERE LOWER(s.email) = LOWER($1)
      ORDER BY e.event_date ASC, e.event_id ASC
    `,
    [studentEmail],
  );

  return result.rows;
};

export const findEventForStudent = async (
  eventId: number,
  studentEmail: string,
): Promise<StudentEventStatus | null> => {
  const result = await pool.query<StudentEventStatus>(
    `
      SELECT
        e.event_id,
        e.title,
        e.event_type,
        e.event_date::text AS event_date,
        e.venue,
        e.url,
        e.is_mandatory,
        e.created_by,
        e.created_at::text AS created_at,
        e.updated_at::text AS updated_at,
        e.deleted_at::text AS deleted_at,
        er.registration_id,
        er.is_registered,
        er.has_attended,
        er.created_at::text AS registration_created_at,
        er.updated_at::text AS registration_updated_at,
        er.deleted_at::text AS registration_deleted_at
      FROM students s
      JOIN events e ON e.event_id = $2 AND e.deleted_at IS NULL
      LEFT JOIN event_registrations er
        ON er.event_id = e.event_id
       AND er.student_id = s.student_id
       AND er.deleted_at IS NULL
      WHERE LOWER(s.email) = LOWER($1)
      LIMIT 1
    `,
    [studentEmail, eventId],
  );

  return result.rows[0] ?? null;
};

export const findRegistrationsForEvent = async (
  eventId: number,
): Promise<EventRegistrationWithStudent[]> => {
  const result = await pool.query<EventRegistrationWithStudent>(
    `
      SELECT
        er.registration_id,
        er.event_id,
        er.student_id,
        s.student_name,
        s.email AS student_email,
        s.roll_number,
        er.is_registered,
        er.has_attended,
        er.created_at::text AS created_at,
        er.updated_at::text AS updated_at,
        er.deleted_at::text AS deleted_at
      FROM event_registrations er
      JOIN students s ON s.student_id = er.student_id
      WHERE er.event_id = $1
        AND er.deleted_at IS NULL
      ORDER BY s.roll_number ASC, s.email ASC
    `,
    [eventId],
  );

  return result.rows;
};

export const findRegistrationsForStudent = async (
  studentEmail: string,
): Promise<StudentEventStatus[]> => {
  const result = await pool.query<StudentEventStatus>(
    `
      SELECT
        e.event_id,
        e.title,
        e.event_type,
        e.event_date::text AS event_date,
        e.venue,
        e.url,
        e.is_mandatory,
        e.created_by,
        e.created_at::text AS created_at,
        e.updated_at::text AS updated_at,
        e.deleted_at::text AS deleted_at,
        er.registration_id,
        er.is_registered,
        er.has_attended,
        er.created_at::text AS registration_created_at,
        er.updated_at::text AS registration_updated_at,
        er.deleted_at::text AS registration_deleted_at
      FROM students s
      JOIN event_registrations er ON er.student_id = s.student_id AND er.deleted_at IS NULL
      JOIN events e ON e.event_id = er.event_id AND e.deleted_at IS NULL
      WHERE LOWER(s.email) = LOWER($1)
      ORDER BY e.event_date ASC, e.event_id ASC
    `,
    [studentEmail],
  );

  return result.rows;
};

export const upsertEventRegistrations = async (
  eventId: number,
  registrations: Array<{
    student_id: number;
    is_registered: boolean;
    has_attended: boolean;
  }>,
): Promise<EventRegistration[]> => {
  if (registrations.length === 0) {
    return [];
  }

  const values: Array<number | boolean> = [];
  const placeholders = registrations
    .map((registration, index) => {
      const base = index * 4;
      values.push(
        eventId,
        registration.student_id,
        registration.is_registered,
        registration.has_attended,
      );
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
    })
    .join(", ");

  const result = await pool.query<EventRegistration>(
    `
      INSERT INTO event_registrations (
        event_id,
        student_id,
        is_registered,
        has_attended
      ) VALUES ${placeholders}
      ON CONFLICT (event_id, student_id)
      DO UPDATE SET
        is_registered = EXCLUDED.is_registered,
        has_attended = EXCLUDED.has_attended,
        deleted_at = NULL,
        updated_at = CURRENT_TIMESTAMP
      RETURNING
        registration_id,
        event_id,
        student_id,
        is_registered,
        has_attended,
        created_at::text AS created_at,
        updated_at::text AS updated_at,
        deleted_at::text AS deleted_at
    `,
    values,
  );

  return result.rows;
};
