import { Router } from "express";
import {
  bulkImportEventRegistrationsHandler,
  createEventHandler,
  deleteEventHandler,
  eventUpload,
  getEventByIdHandler,
  getEventRegistrationsHandler,
  getEventsHandler,
  getMyEventStatusesHandler,
  updateEventHandler,
} from "../controllers/eventsController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/events", authorize(["admin", "student"]), getEventsHandler);
router.get("/events/my", authorize(["student"]), getMyEventStatusesHandler);
router.get("/events/:eventId", authorize(["admin", "student"]), getEventByIdHandler);
router.post("/events", authorize(["admin"]), createEventHandler);
router.patch("/events/:eventId", authorize(["admin"]), updateEventHandler);
router.delete("/events/:eventId", authorize(["admin"]), deleteEventHandler);
router.get("/events/:eventId/registrations", authorize(["admin"]), getEventRegistrationsHandler);
router.post(
  "/events/:eventId/registrations/bulk-upload",
  authorize(["admin"]),
  eventUpload.single("file"),
  bulkImportEventRegistrationsHandler,
);

export default router;
