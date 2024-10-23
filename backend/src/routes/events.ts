import express from 'express';
import { S3Service } from '../services/s3Service';

const router = express.Router();

const s3 = new S3Service();

// single session events
router.get('/:fileName', async (req, res) => {
  const fileName = req.params.fileName;

  try {
    const data = await s3.getFile(fileName);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching session events from S3', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;