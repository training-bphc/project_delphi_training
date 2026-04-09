import multer from "multer";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  bulkImportEventRegistrations,
  createEventRecord,
  deleteEventRecord,
  getEventByIdForRole,
  getEventRegistrations,
  getEventsForRole,
  getMyEventStatuses,
  updateEventRecord,
} from "../services/eventsService";

export const eventUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const parseEventId = (value: string): number | null => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const getCsvContent = (req: Request): string | null => {
  if (!req.file) {
    return null;
  }

  if (!req.file.originalname.endsWith(".csv") && req.file.mimetype !== "text/csv") {
    return null;
  }

  return req.file.buffer.toString("utf-8");
};

export const getEventsHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await getEventsForRole(req.user?.role ?? "student", req.user?.email ?? "");
  res.status(200).json({ success: true, data });
});

export const getEventByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const eventId = parseEventId(req.params.eventId);
  if (!eventId) {
    res.status(400).json({ success: false, message: "Invalid event ID" });
    return;
  }

  const data = await getEventByIdForRole(eventId, req.user?.role ?? "student", req.user?.email ?? "");
  if (!data) {
    res.status(404).json({ success: false, message: "Event not found" });
    return;
  }

  res.status(200).json({ success: true, data });
});

export const createEventHandler = asyncHandler(async (req: Request, res: Response) => {
  const actorEmail = req.user?.email;
  if (!actorEmail) {
    res.status(401).json({ success: false, message: "Authenticated user email not found" });
    return;
  }

  try {
    const event = await createEventRecord(req.body, actorEmail);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    if (error instanceof Error) {
      const messages = [
        "title is required",
        "event_type is required",
        "event_date is required",
        "event_date must be in YYYY-MM-DD format",
        "event_date is invalid",
        "venue is required",
        "url must be a string",
        "Invalid url",
        "url must be a valid http or https URL",
        "is_mandatory must be a boolean value",
      ];

      if (messages.includes(error.message) || error.message.includes("must be at most")) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
    }

    throw error;
  }
});

export const updateEventHandler = asyncHandler(async (req: Request, res: Response) => {
  const eventId = parseEventId(req.params.eventId);
  if (!eventId) {
    res.status(400).json({ success: false, message: "Invalid event ID" });
    return;
  }

  try {
    const event = await updateEventRecord(eventId, req.body);
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    if (error instanceof Error) {
      const messages = [
        "At least one event field must be provided",
        "title is required",
        "event_type is required",
        "event_date is required",
        "event_date must be in YYYY-MM-DD format",
        "event_date is invalid",
        "venue is required",
        "url must be a string",
        "Invalid url",
        "url must be a valid http or https URL",
        "is_mandatory must be a boolean value",
      ];

      if (messages.includes(error.message) || error.message.includes("must be at most")) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
    }

    throw error;
  }
});

export const deleteEventHandler = asyncHandler(async (req: Request, res: Response) => {
  const eventId = parseEventId(req.params.eventId);
  if (!eventId) {
    res.status(400).json({ success: false, message: "Invalid event ID" });
    return;
  }

  const deleted = await deleteEventRecord(eventId);
  if (!deleted) {
    res.status(404).json({ success: false, message: "Event not found" });
    return;
  }

  res.status(200).json({ success: true, message: "Event deleted" });
});

export const getEventRegistrationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const eventId = parseEventId(req.params.eventId);
  if (!eventId) {
    res.status(400).json({ success: false, message: "Invalid event ID" });
    return;
  }

  try {
    const registrations = await getEventRegistrations(eventId);
    res.status(200).json({ success: true, data: registrations });
  } catch (error) {
    if (error instanceof Error && error.message === "Event not found") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }

    throw error;
  }
});

export const bulkImportEventRegistrationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const eventId = parseEventId(req.params.eventId);
  if (!eventId) {
    res.status(400).json({ success: false, message: "Invalid event ID" });
    return;
  }

  const csvContent = getCsvContent(req);
  if (!csvContent) {
    res.status(400).json({ success: false, message: "File must be a CSV file" });
    return;
  }

  try {
    const result = await bulkImportEventRegistrations(eventId, csvContent);

    // Return 422 when nothing was processed (empty CSV or all rows failed)
    const isFullFailure = result.success === 0 && result.errors.length > 0;

    res.status(isFullFailure ? 422 : 201).json({
      success: !isFullFailure,
      message: `Bulk import completed. ${result.success} registrations processed, ${result.failed} failed.`,
      data: {
        summary: {
          total_processed: result.success + result.failed,
          successful: result.success,
          failed: result.failed,
        },
        registrations: result.registrations,
        errors: result.errors,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Event not found") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }

    if (error instanceof Error && error.message.startsWith("CSV parsing failed:")) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    throw error;
  }
});

export const getMyEventStatusesHandler = asyncHandler(async (req: Request, res: Response) => {
  const actorEmail = req.user?.email;
  if (!actorEmail) {
    res.status(401).json({ success: false, message: "Authenticated user email not found" });
    return;
  }

  const statuses = await getMyEventStatuses(actorEmail);
  res.status(200).json({ success: true, data: statuses });
});
