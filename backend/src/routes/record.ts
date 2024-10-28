import express from 'express';
import { RedisService } from '../services/redisService';
import { PsqlService } from '../services/psqlService';
import { time } from 'console';
const router = express.Router();

const redis = new RedisService();
const psql = new PsqlService();

router.post('/', async (req, res) => {
  const { projectID, sessionID, events } = req.body;

  try {
    // Check for valid project in PSQL
    const projectMetadata = await psql.getProject(projectID);

    if (!projectMetadata) {
      console.log(`Project not found for ${projectID}. Rejecting request`);
      // Reject the request >> 404?
      return res.status(400).json({ error: 'Invalid project' });
    } else {
      console.log(`Valid project ${projectID} found for incoming request`);
    }

    // Check for session metadata in PSQL
    const sessionMetadata = await psql.getActiveSession(sessionID);
    
    if (!sessionMetadata) {
      const eventTimestamp = new Date(events[0].timestamp).toISOString();;
      console.log(`Active session not found in PSQL for ${sessionID}. Creating...`);
      await psql.addSession(projectID, sessionID, eventTimestamp);
    } else {
      const eventTimestamp = new Date(events[events.length - 1].timestamp).toISOString();;
      console.log(`Active session found in PSQL for ${sessionID}. Updating... `);
      await psql.updateSessionLastActivity(sessionID, eventTimestamp);
    }
    
    // Add session event data to Redis
    console.log(`Moving ${events.length} events for session ${sessionID} to Redis...`)
    await redis.addRecording(sessionID, events);

    res.status(200).json({ message: `Events batch for session ${sessionID} processed successfully` });
    } catch (error) {
      console.error(`Error processing batch for session ${sessionID}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
