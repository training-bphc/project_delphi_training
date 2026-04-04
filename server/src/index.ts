import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import net from "net";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import recordsRoutes from "./routes/recordsRoutes.js";
import resourcesRoutes from "./routes/resourcesRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import { requestLogger } from "./middleware/logger";

dotenv.config();

const app: Application = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5000;

const findAvailablePort = async (startPort: number): Promise<number> => {
  const checkPort = (port: number): Promise<boolean> =>
    new Promise((resolve) => {
      const tester = net
        .createServer()
        .once("error", () => resolve(false))
        .once("listening", () => {
          tester.close(() => resolve(true));
        })
        .listen(port);
    });

  let currentPort = startPort;
  while (!(await checkPort(currentPort))) {
    currentPort += 1;
  }
  return currentPort;
};

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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
app.use("/api", recordsRoutes);
app.use("/api", resourcesRoutes);
app.use("/api/students", studentRoutes);

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
    const port = await findAvailablePort(DEFAULT_PORT);

    if (port !== DEFAULT_PORT) {
      console.warn(
        `[SERVER] Port ${DEFAULT_PORT} is in use. Started on available port ${port} instead.`,
      );
    }

    app.listen(port, () => {
      console.log(`[SERVER] Running on http://localhost:${port}`);
      console.log(
        `[SERVER] Environment: ${process.env.NODE_ENV || "development"}`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();

export default app;
