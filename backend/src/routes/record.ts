import express from 'express';
import { RedisService } from '../services/redisService.js';
import { PsqlService } from '../services/psqlService.js';
const router = express.Router();

interface RrwebEvent {
  type: number; // Event type enum
  timestamp: number;
  data: any; // Varies per event type
}

interface SessionRequestBody {
  projectID: string;
  sessionID: string;
  events: RrwebEvent[];
}

const redis: RedisService = new RedisService();
const psql: PsqlService = new PsqlService();

router.post('/', async (req: express.Request<{}, {}, SessionRequestBody>, res: express.Response) => {
  const { projectID, sessionID, events } = req.body;

  if (!projectID || !sessionID || !Array.isArray(events)) {
    return res.status(400).send('Invalid request body');
  }

  try {
    const projectMetadata = await psql.getProject(projectID);

    if (!projectMetadata) {
      console.log(`Project not found for ${projectID}. Rejecting request`);
      return res.status(400).json({ error: 'Invalid project' });
    } else {
      console.log(`Valid project ${projectID} found for incoming request`);
    }

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
    
    console.log(`Moving ${events.length} events for session ${sessionID} to Redis...`)
    await redis.addRecording(sessionID, events);

    res.status(200).json({ message: `Events batch for session ${sessionID} processed successfully` });
    } catch (error) {
      console.error(`Error processing batch for session ${sessionID}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
