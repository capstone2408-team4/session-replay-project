import express from 'express';
import cors from 'cors';
import pkg from 'body-parser';
const { json, urlencoded } = pkg;
import psqlRoutes from './routes/psqlRoutes';
import s3Routes from './routes/s3Routes';
import redisRoutes from './routes/redisRoutes';
import recordRouter from './routes/record';
import path from 'path';
import { fork } from 'child_process';
import { fileURLToPath } from 'url';


const app = express();

// Middleware
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cors());

app.use('/api/record', recordRouter);

// Spawn worker process
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workerPath = path.join(__dirname, 'workers', 'inactiveSessionWorker.ts');
const worker = fork(workerPath);

worker.on('error', (error) => {
  console.error('Worker process error:', error);
});

worker.on('exit', (code, signal) => {
  console.log(`Worker process exited with code ${code} and signal ${signal}`);
  // Restart?
});

// Test routes
app.use('/api/psql', psqlRoutes);
app.use('/api/s3', s3Routes);
app.use('/api/redis', redisRoutes);

export default app;