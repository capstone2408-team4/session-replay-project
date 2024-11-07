import { PsqlService } from '../services/psqlService';
import { RedisService } from '../services/redisService';
import { S3Service } from '../services/s3Service';
import { OpenAIService } from '../services/openAIService';
import { QdrantService } from '../services/qdrantService';  
import { SessionPreprocessor } from '../preprocessor/SessionPreprocessor';

const psql = new PsqlService();
const redis = new RedisService();
const s3 = new S3Service();
const openAI = new OpenAIService();
const qdrant = new QdrantService();
const preprocessor = new SessionPreprocessor();

// Configuration (this could be moved elsewhere like environment or config.ts)
const INACTIVITY_THRESHOLD = 1 * 60 * 1000; // 1 minute in milliseconds
const CHECK_INTERVAL = 30000; // 30 seconds in milliseconds

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

    // Get session events from Redis
    const events = await redis.getRecording(sessionID);

    if (events) {
      // Store raw events in S3
      await s3.addFile(fileName, events).catch(error => {
        console.error(`[worker] Error adding session ${sessionID} to S3:`, error);
        throw new Error('Failed to add session to S3. Session will not be removed from Redis.');
      });

      // Preprocess the session events
      const processedSession = preprocessor.process(events);

      // Store processed events in S3
      await s3.addFile(`processed-${fileName}`, processedSession).catch(error => {
        console.error(`[worker] Error adding processed session ${sessionID} to S3:`, error);
        throw new Error('Failed to add processed session to S3. Session will not be removed from Redis.');
      });
      
      // Get AI summary
      const summary = await openAI.summarizeSession(processedSession);
      console.log(`[worker] Generated summary for ${sessionID}`, summary);

      // Add session summary to PSQL
      await psql.addSessionSummary(sessionID, summary);

      // Update session metadata PSQL
      await psql.endSession(sessionID, timestamp);

      // Turn summary into embedding
      const embedding = await openAI.embeddingQuery(summary);

      // Inject the summary into processedSession.metadata
      processedSession.metadata.summary = summary;
      
      // Embed vectors in vector DB
      await qdrant.addVector(embedding, sessionID, processedSession.metadata);

      // Delete session event data from Redis
      await redis.deleteRecording(sessionID);

      console.log(`[worker] Successfully ended and processed session ${sessionID}`);
    } else {
      console.warn(`[worker] No events found for session ${sessionID}`);
    }
  } catch (error) {
    console.error(`[worker] Error handling session end for ${sessionID}:`, error);
    // Retry logic?
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