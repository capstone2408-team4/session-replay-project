import express from 'express';
import { PsqlService } from '../services/psqlService.js';

const router = express.Router();

const psql = new PsqlService();

router.get('/:projectID', async (req, res) => {
  const projectID = req.params.projectID;

  try {
    const data = await psql.getCompletedSessions(projectID);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching completed sessions from PSQL', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;