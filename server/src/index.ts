// Server Entry Point

import express, { Application, Request, Response } from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import dotenv  from 'dotenv';

import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import { dot } from 'node:test/reporters';
import { requestLogger }  from './middleware/logger';
//import studentRoutes from './routes/studentRoutes'; - for later
//import adminRoutes from './routes/adminRoutes'; - for later

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(helmet()); // http headers for security
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
})); // enable CORS with credentials support
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request/Response Logger: Logs all incoming requests and outgoing responses for debugging
app.use(requestLogger);

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
// TODO: Add student and admin routes when implemented

// 404 Error Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// TODO: Add a global error handler

const start = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

export default app;


