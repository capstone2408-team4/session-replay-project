import express from 'express';
import { RedisService } from '../services/redisService';
import { PsqlService } from '../services/psqlService';
import { S3Service } from '../services/s3Service';

const router = express.Router();

const s3 = new S3Service();
const psql = new PsqlService();

// all sessions from psql for populating left sidebar
router.get('/:projectID', async (req, res) => {
  const projectID = req.params.projectID;

  try {
    const data = await psql.getCompletedSessions(projectID);
    console.log('data returned from psql ==> ', data);
    res.status(200).json({ data });
  } catch (error) {
    console.error('Error fetching completed sessions from PSQL', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// single session
// GET localhost:5001/api/events/:fileName
router.get('/:fileName', async (req, res) => {
  const fileName = req.params.fileName;

  try {
    const data = await s3.getFile(fileName);
    res.status(200).json({ data });
  } catch (error) {
    console.error('Error fetching session events from S3', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
  
  