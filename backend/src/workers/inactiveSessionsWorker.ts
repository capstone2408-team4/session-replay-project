import { PsqlService } from '../services/psqlService.js';
import { RedisService } from '../services/redisService.js';
import { S3Service } from '../services/s3Service.js';
import { OpenAIService } from '../services/openAIService.js';
import { QdrantService } from '../services/qdrantService.js';  
import { SessionPreprocessor } from '../preprocessor/SessionPreprocessor.js';

const psql = new PsqlService();
const redis = new RedisService();
const s3 = new S3Service();
const openAI = new OpenAIService();
const qdrant = new QdrantService();
const preprocessor = new SessionPreprocessor();

// Configuration
const INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
const CHECK_INTERVAL = 60000; // 1 minute in milliseconds

async function checkInactiveSessions() {
  try {
    const cutoffTime = new Date(Date.now() - INACTIVITY_THRESHOLD).toISOString();
    const inactiveSessions = await psql.getInactiveSessions(cutoffTime);

    console.log(`[worker] Found ${inactiveSessions.length} inactive sessions`);

    for (const session of inactiveSessions) {
      await handleSessionEnd(session.session_id, session.file_name);
    }
  } catch (error) {
    console.error('[worker] Error checking inactive sessions', error);
  }
}

async function handleSessionEnd(sessionID: string, fileName: string) {
  try {
    console.log(`[worker] ending session ${sessionID}...`)
    const timestamp = new Date().toISOString(); // UTC

    const events = await redis.getRecording(sessionID);

    if (events) {
      await s3.addFile(fileName, events).catch(error => {
        console.error(`[worker] Error adding session ${sessionID} to S3:`, error);
        throw new Error('Failed to add session to S3. Session will not be removed from Redis.');
      });

      const processedSession = preprocessor.process(sessionID, events);

      await s3.addFile(`processed-${fileName}`, processedSession).catch(error => {
        console.error(`[worker] Error adding processed session ${sessionID} to S3:`, error);
        throw new Error('Failed to add processed session to S3. Session will not be removed from Redis.');
      });

      const summary = await openAI.summarizeSession(processedSession);
      console.log(`[worker] Generated summary for ${sessionID}`);

      await psql.addSessionSummary(sessionID, summary);

      await psql.endSession(sessionID, timestamp);

      const embedding = await openAI.embeddingQuery(summary);

      processedSession.metadata.summary = summary;

      await qdrant.addVector(embedding, sessionID, processedSession.metadata);

      await redis.deleteRecording(sessionID);

      console.log(`[worker] Successfully ended and processed session ${sessionID}`);
    } else {
      console.warn(`[worker] No events found for session ${sessionID}`);
    }
  } catch (error) {
    console.error(`[worker] Error handling session end for ${sessionID}:`, error);
  }
}

async function runWorker() {
  console.log('[worker] Worker started');
  while (true) {
    try {
      await checkInactiveSessions();
    } catch (error) {
      console.error('[worker] Error in worker loop:', error);
    }
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
}

runWorker().catch(error => {
  console.error('[worker] Worker process crashed:', error);
  process.exit(1);
});