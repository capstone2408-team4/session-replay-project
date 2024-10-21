import { PsqlService } from '../services/psqlService';
import { RedisService } from '../services/redisService';
import { S3Service } from '../services/s3Service';

const psql = new PsqlService();
const redis = new RedisService();
const s3 = new S3Service();

// Configuration (this could be moved elsewhere like environment or config.ts)
const INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
const CHECK_INTERVAL = 60000; // 1 minute in milliseconds

async function checkInactiveSessions() {
  try {
    const cutoffTime = new Date(Date.now() - INACTIVITY_THRESHOLD).toISOString();
    const inactiveSessions = await psql.getInactiveSessions(cutoffTime);

    console.log(`Found ${inactiveSessions.length} inactive sessions`);

    for (const session of inactiveSessions) {
      await handleSessionEnd(session.id);
    }
  } catch (error) {
    console.error('Error checking inactive sessions', error);
  }
}

async function handleSessionEnd(sessionId: string) {
  try {
    // Get session events from Redis
    const events = await redis.getRecording(sessionId);

    if (events) {
      // Add to S3
      const fileName = `${sessionId}-events.txt`;
      await s3.addFile(fileName, events);

      // Update session metadata PSQL
      const timestamp = new Date().toISOString(); // UTC
      await psql.endSession(sessionId, timestamp);

      // Delete session event data from Redis
      await redis.deleteRecording(sessionId);

      console.log(`Successfully ended and processed session ${sessionId}`);
    } else {
      console.warn(`No events found for session ${sessionId}`);
    }
  } catch (error) {
    console.error('Error handling session end:', error);
    // Retry logic?
  }
}

async function runWorker() {
  console.log('Worker started');
  while (true) {
    try {
      await checkInactiveSessions();
    } catch (error) {
      console.error('Error in worker loop:', error);
    }
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
}

runWorker().catch(error => {
  console.error('Worker process crashed:', error);
  process.exit(1);
});
