import express from 'express';
import { RedisController } from '../controllers/redisController';

const router = express.Router();
const redisController = new RedisController();

router.post('/', redisController.addRecording);
router.get('/:id', redisController.getAndSummarizeRecording);

export default router;