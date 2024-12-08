import express from 'express';
import cors from 'cors';
import pkg from 'body-parser';
const { json, urlencoded } = pkg;
import cookieParser from 'cookie-parser';
import recordRouter from './routes/record.js';
import projectsRouter from './routes/projects.js';
import eventsRouter from './routes/events.js';
import geoRouter from './routes/geo.js';
import multiSummaryRouter from './routes/multi-summary.js';
import chatbotQueryRouter from './routes/chatbot-query.js';
import dashAuthRouter from './routes/auth.js';
import { authenticateToken } from './middleware/dashboardAuth.js';
import path from 'path';
import { fork } from 'child_process';
import { fileURLToPath } from 'url';


const app = express();

// Middleware
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(json({
  limit: '10mb'
}));
app.use(cors({
  origin: true,
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
app.use('/api/auth', dashAuthRouter);
app.use('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// Protected routes -- dashboard
app.use('/api/projects', authenticateToken, projectsRouter);
app.use('/api/events', authenticateToken, eventsRouter);
app.use('/api/multi-summary', authenticateToken, multiSummaryRouter);
app.use('/api/chatbot-query', authenticateToken, chatbotQueryRouter);

// Spawn worker process
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Catch-all route to serve the index.html file for non-API routes
app.get('*', (req, res) => {
  // Only handle non-API routes
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});

const workerPath = path.join(__dirname, 'workers', 'inactiveSessionsWorker.js');
const worker = fork(workerPath);

worker.on('error', (error) => {
  console.error('Worker process error:', error);
});

worker.on('exit', (code, signal) => {
  console.log(`Worker process exited with code ${code} and signal ${signal}`);
});

export default app;