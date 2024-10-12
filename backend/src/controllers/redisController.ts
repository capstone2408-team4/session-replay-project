import { Request, Response } from 'express';
import { RedisService } from '../services/redisService';
import { OpenAIService } from '../services/openAIService';

export class RedisController {
  private redisService: RedisService;
  private openAIService: OpenAIService;

  constructor() {
    this.redisService = new RedisService();
    this.openAIService = new OpenAIService();
  }

  addRecording = async (req: Request, res: Response): Promise<void> => {
    const { sessionId, data } = req.body;
    try {
      await this.redisService.addRecording(sessionId, JSON.stringify(data));
      res.json({ message: 'Recording added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add recording' });
    }
  };

  getAndSummarizeRecording = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    try {
      const data = await this.redisService.getRecording(id);
      if (data) {
        const summary = await this.openAIService.summarizeSession(data);
        res.json({ summary });
      } else {
        res.status(404).json({ error: 'Recording not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve or summarize recording' });
    }
  };
}