import express from 'express';

import { PsqlService } from '../services/psqlService';
import { OpenAIService } from '../services/openAIService';

const psql: PsqlService = new PsqlService();
const openAI = new OpenAIService();
const router = express.Router();

router.post('/', async (req, res) => {
  const { ids }  = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid input: ids should be a non-empty array' });
  }

  try {
    const summaries = await psql.getSummaries(ids);
    const summary = await openAI.summarizeMultipleSessions(summaries);

    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching multi summaries', error);
    res.status(500).json({ error: 'Internal server error'});
  }
});

export default router;