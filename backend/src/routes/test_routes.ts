// // This is ALL for testing purposes

// import express, { Request, Response } from 'express';
// import PSQL from '../controllers/psql';
// import S3 from '../controllers/s3';
// import RedisDB from '../controllers/redis_db';
// import OpenAIInterface from '../models/open_ai';

// export const redisRouter = express.Router();
// export const psqlListRouter = express.Router();
// export const s3Router = express.Router();

// const psql = new PSQL();
// const s3 = new S3();
// const redisDB = new RedisDB();
// const openAI = new OpenAIInterface();

// // PSQL routes
// psqlListRouter.get('/:id', async (req: Request, res: Response) => {
//   const id = req.params.id;
//   try {
//     const data = await psql.getSession(id);
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to retrieve session' });
//   }
// });

// psqlListRouter.post('/', async (req: Request, res: Response) => {
//   const { name } = req.body;
//   try {
//     const result = await psql.addItem(name);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to add item' });
//   }
// });

// // S3 routes
// s3Router.get('/:id', async (req: Request, res: Response) => {
//   const id = req.params.id;
//   try {
//     const data = await s3.getFile(id);
//     res.send(String(data));
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to retrieve file' });
//   }
// });

// s3Router.post('/', async (req: Request, res: Response) => {
//   const { key, data } = req.body;
//   try {
//     const location = await s3.addFile(key, data);
//     res.json({ location });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to add file' });
//   }
// });

// // Redis routes
// redisRouter.post('/', async (req: Request, res: Response) => {
//   const { sessionId, data } = req.body;
//   try {
//     await redisDB.addRecording(sessionId, data);
//     res.json({ message: 'Recording added successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to add recording' });
//   }
// });

// redisRouter.get('/:id', async (req: Request, res: Response) => {
//   const id = req.params.id;
//   try {
//     const data = await redisDB.getRecording(id);
//     const summary = await openAI.summarizeSession(data);
//     res.json({ summary });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to retrieve or summarize recording' });
//   }
// });