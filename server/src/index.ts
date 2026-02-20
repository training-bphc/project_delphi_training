import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import sampleTestDataRoutes from "./routes/sampleTestDataRoutes";
import { requestLogger } from "./middleware/logger";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", sampleTestDataRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler — must have exactly 4 parameters for Express to
// recognise it as an error handler. Catches anything passed to next(err).
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[ERROR]", err.message, err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const start = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();

export default app;
