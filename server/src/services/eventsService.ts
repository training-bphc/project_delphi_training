import { parse } from "csv-parse/sync";
import { findStudentsByEmails } from "../repositories/studentRepository";
import {
  createEvent,
  findAllEvents,
  findEventById,
  findEventForStudent,
  findEventsForStudent,
  findRegistrationsForEvent,
  findRegistrationsForStudent,
  softDeleteEvent,
  updateEvent,
  upsertEventRegistrations,
} from "../repositories/eventsRepository";
import {
  CreateEventInput,
  Event,
  EventRegistration,
  EventRegistrationWithStudent,
  StudentEventStatus,
  UpdateEventInput,
} from "../types";

export interface BulkEventRegistrationResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; email?: string; error: string }>;
  registrations: EventRegistration[];
}

interface ParsedRegistrationRecord {
  email?: string;
  is_registered?: string;
  has_attended?: string;
  [key: string]: string | undefined;
}

const MAX_TEXT_LENGTH = 255;

const normalizeText = (value: unknown, fieldName: string, maxLength = MAX_TEXT_LENGTH): string => {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} is required`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${fieldName} is required`);
  }

  if (normalized.length > maxLength) {
    throw new Error(`${fieldName} must be at most ${maxLength} characters`);
  }

  return normalized;
};

const normalizeOptionalUrl = (value: unknown): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("url must be a string");
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error("Invalid url");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("url must be a valid http or https URL");
  }

  return normalized;
};

const normalizeEventDate = (value: unknown): string => {
  if (typeof value !== "string") {
    throw new Error("event_date is required");
  }

  const normalized = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error("event_date must be in YYYY-MM-DD format");
  }

  // Strict calendar date validation: re-parse and compare to detect overflow (e.g. 2026-02-30)
  const [year, month, day] = normalized.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() + 1 !== month ||
    parsed.getDate() !== day
  ) {
    throw new Error("event_date is invalid");
  }

  return normalized;
};

const parseBoolean = (value: unknown, fieldName: string): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(normalized)) return true;
    if (["false", "0", "no", "n"].includes(normalized)) return false;
  }

  throw new Error(`${fieldName} must be a boolean value`);
};

const parseImportBoolean = (value: string | undefined, fieldName: string): boolean => {
  if (value === undefined) {
    throw new Error(`Missing required field: ${fieldName}`);
  }

  return parseBoolean(value, fieldName);
};

const normalizeEventInput = (payload: {
  title?: unknown;
  event_type?: unknown;
  event_date?: unknown;
  venue?: unknown;
  url?: unknown;
  is_mandatory?: unknown;
}): CreateEventInput => {
  return {
    title: normalizeText(payload.title, "title"),
    event_type: normalizeText(payload.event_type, "event_type", 100),
    event_date: normalizeEventDate(payload.event_date),
    venue: normalizeText(payload.venue, "venue"),
    url: normalizeOptionalUrl(payload.url),
    is_mandatory:
      payload.is_mandatory === undefined ? false : parseBoolean(payload.is_mandatory, "is_mandatory"),
  };
};

const normalizeEventPatchInput = (payload: {
  title?: unknown;
  event_type?: unknown;
  event_date?: unknown;
  venue?: unknown;
  url?: unknown;
  is_mandatory?: unknown;
}): UpdateEventInput => {
  const normalized: UpdateEventInput = {};

  if (payload.title !== undefined) {
    normalized.title = normalizeText(payload.title, "title");
  }

  if (payload.event_type !== undefined) {
    normalized.event_type = normalizeText(payload.event_type, "event_type", 100);
  }

  if (payload.event_date !== undefined) {
    normalized.event_date = normalizeEventDate(payload.event_date);
  }

  if (payload.venue !== undefined) {
    normalized.venue = normalizeText(payload.venue, "venue");
  }

  if (payload.url !== undefined) {
    normalized.url = normalizeOptionalUrl(payload.url);
  }

  if (payload.is_mandatory !== undefined) {
    normalized.is_mandatory = parseBoolean(payload.is_mandatory, "is_mandatory");
  }

  return normalized;
};

const parseCsvContent = (csvContent: string): ParsedRegistrationRecord[] => {
  try {
    return parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (error) {
    throw new Error(
      `CSV parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const getEventsForRole = async (
  role: "admin" | "student",
  email: string,
): Promise<Event[] | StudentEventStatus[]> => {
  if (role === "student") {
    return findEventsForStudent(email);
  }

  return findAllEvents();
};

export const getEventByIdForRole = async (
  eventId: number,
  role: "admin" | "student",
  email: string,
): Promise<Event | StudentEventStatus | null> => {
  if (role === "student") {
    return findEventForStudent(eventId, email);
  }

  return findEventById(eventId);
};

export const getEventRegistrations = async (
  eventId: number,
): Promise<EventRegistrationWithStudent[]> => {
  const event = await findEventById(eventId, true);
  if (!event) {
    throw new Error("Event not found");
  }

  return findRegistrationsForEvent(eventId);
};

export const getMyEventStatuses = async (
  studentEmail: string,
): Promise<StudentEventStatus[]> => {
  return findRegistrationsForStudent(studentEmail);
};

export const createEventRecord = async (
  payload: unknown,
  actorEmail: string,
): Promise<Event> => {
  const normalized = normalizeEventInput(payload as Record<string, unknown>);
  return createEvent(normalized, actorEmail);
};

export const updateEventRecord = async (
  eventId: number,
  payload: unknown,
): Promise<Event | null> => {
  const normalized = normalizeEventPatchInput(payload as Record<string, unknown>);
  if (Object.keys(normalized).length === 0) {
    throw new Error("At least one event field must be provided");
  }

  return updateEvent(eventId, normalized);
};

export const deleteEventRecord = async (eventId: number): Promise<boolean> => {
  return softDeleteEvent(eventId);
};

export const bulkImportEventRegistrations = async (
  eventId: number,
  csvContent: string,
): Promise<BulkEventRegistrationResult> => {
  const event = await findEventById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  const parsedRecords = parseCsvContent(csvContent);
  if (parsedRecords.length === 0) {
    return {
      success: 0,
      failed: 0,
      errors: [{ row: 0, error: "CSV file is empty" }],
      registrations: [],
    };
  }

  const errors: Array<{ row: number; email?: string; error: string }> = [];
  const seenEmails = new Set<string>();

  // Pre-pass: collect valid emails and validate boolean fields before hitting the DB
  interface PreValidatedRow {
    rowNumber: number;
    rawEmail: string;
    normalizedEmail: string;
    isRegistered: boolean;
    hasAttended: boolean;
  }
  const preValidated: PreValidatedRow[] = [];

  for (let index = 0; index < parsedRecords.length; index += 1) {
    const rowNumber = index + 2;
    const record = parsedRecords[index];
    const rawEmail = record.email?.trim();

    if (!rawEmail) {
      errors.push({ row: rowNumber, error: "Missing required field: email" });
      continue;
    }

    const normalizedEmail = rawEmail.toLowerCase();
    if (seenEmails.has(normalizedEmail)) {
      errors.push({
        row: rowNumber,
        email: rawEmail,
        error: `Duplicate email in CSV: ${rawEmail}`,
      });
      continue;
    }
    seenEmails.add(normalizedEmail);

    let isRegistered: boolean;
    let hasAttended: boolean;

    try {
      isRegistered = parseImportBoolean(record.is_registered, "is_registered");
      hasAttended = parseImportBoolean(record.has_attended, "has_attended");
    } catch (error) {
      errors.push({
        row: rowNumber,
        email: rawEmail,
        error: error instanceof Error ? error.message : "Invalid boolean value",
      });
      continue;
    }

    if (hasAttended && !isRegistered) {
      errors.push({
        row: rowNumber,
        email: rawEmail,
        error: "has_attended cannot be true when is_registered is false",
      });
      continue;
    }

    preValidated.push({ rowNumber, rawEmail, normalizedEmail, isRegistered, hasAttended });
  }

  // Single DB query to resolve all emails to student IDs
  const studentMap = await findStudentsByEmails(preValidated.map((r) => r.normalizedEmail));

  const validRows: Array<{
    student_id: number;
    is_registered: boolean;
    has_attended: boolean;
  }> = [];

  for (const row of preValidated) {
    const student = studentMap.get(row.normalizedEmail);
    if (!student) {
      errors.push({
        row: row.rowNumber,
        email: row.rawEmail,
        error: `Student not found for email: ${row.rawEmail}`,
      });
      continue;
    }

    validRows.push({
      student_id: student.student_id,
      is_registered: row.isRegistered,
      has_attended: row.hasAttended,
    });
  }

  if (validRows.length === 0) {
    return {
      success: 0,
      failed: errors.length,
      errors,
      registrations: [],
    };
  }

  const registrations = await upsertEventRegistrations(eventId, validRows);

  return {
    success: registrations.length,
    failed: errors.length,
    errors,
    registrations,
  };
};
