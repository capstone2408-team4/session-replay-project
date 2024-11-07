import express from 'express';
import cors from 'cors';
import pkg from 'body-parser';
const { json, urlencoded } = pkg;
import cookieParser from 'cookie-parser';
import recordRouter from './routes/record';
import projectsRouter from './routes/projects';
import eventsRouter from './routes/events';
import geoRouter from './routes/geo';
import multiSummaryRouter from './routes/multi-summary';
import chatbotQueryRouter from './routes/chatbot-query';
import loginRouter from './routes/login';
import logoutRouter from './routes/logout';
import { authenticateToken } from './middleware/dashboardAuth';
import path from 'path';
import { fork } from 'child_process';
import { fileURLToPath } from 'url';


const app = express();

// Middleware
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(json({
  limit: '10mb' // Increase JSON payload limit
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://yourdomain.com'
    : 'http://localhost:5173',
  credentials: true
}));

// Log request payload size
app.use('/api/record', (req, res, next) => {
  const contentLength = req.headers['content-length'];
  console.log(`Batch request body: ${contentLength} bytes`);
  next();
});

// Public routes
app.use('/api/record', recordRouter);
app.use('/api/geo', geoRouter);
app.use('/api/login', loginRouter);
app.use('/api/logout', logoutRouter);

// Protected routes -- dashboard
app.use('/api/projects', authenticateToken, projectsRouter);
app.use('/api/events', authenticateToken, eventsRouter);
app.use('/api/multi-summary', authenticateToken, multiSummaryRouter);
app.use('/api/chatbot-query', authenticateToken, chatbotQueryRouter);

// Spawn worker process
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workerPath = path.join(__dirname, 'workers', 'inactiveSessionsWorker.ts');
const worker = fork(workerPath);

worker.on('error', (error) => {
  console.error('Worker process error:', error);
});

worker.on('exit', (code, signal) => {
  console.log(`Worker process exited with code ${code} and signal ${signal}`);
  // Restart?
});

export default app;