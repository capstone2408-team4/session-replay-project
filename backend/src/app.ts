import express from 'express';
import cors from 'cors';
import pkg from 'body-parser';
const { json, urlencoded } = pkg;
import recordRouter from './routes/record';
import projectsRouter from './routes/projects';
import eventsRouter from './routes/events';
import geoRouter from './routes/geo';
import multiSummaryRouter from './routes/multi-summary';
import chatbotQueryRouter from './routes/chatbot-query';
import path from 'path';
import { fork } from 'child_process';
import { fileURLToPath } from 'url';


const app = express();

// Middleware
app.use(urlencoded({ extended: true }));
app.use(json({
  limit: '10mb' // Increase JSON payload limit
}));
app.use(cors());

// Log request payload size
app.use('/api/record', (req, res, next) => {
  const contentLength = req.headers['content-length'];
  console.log(`Batch request body: ${contentLength} bytes`);
  next();
});

app.use('/api/record', recordRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/geo', geoRouter);
app.use('/api/multi-summary', multiSummaryRouter);
app.use('/api/chatbot-query', chatbotQueryRouter);

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