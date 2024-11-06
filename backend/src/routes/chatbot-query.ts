import express from 'express';
import { QdrantService } from '../services/qdrantService';
import { OpenAIService } from '../services/openAIService';
import { ChatbotSystemPrompt, ChatbotUserPrompt } from '../utils/aiModelsConfig';

const router = express.Router();

const qdrant = new QdrantService();
const openAI = new OpenAIService();

interface ChatbotQueryRequest {
  query: string;
}

router.post('/', async (req: express.Request<{}, {}, ChatbotQueryRequest>, res: express.Response) => {
  try {
    console.log('Received request body:', req.body);

    // Input validation
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      console.error('Invalid query received:', query);
      return res.status(400).json({
        error: 'Query must be provided as a non-empty string'
      });
    }

    console.log('Processing query:', query);

    // Generate embedding
    let embeddedQuery;
    try {
      embeddedQuery = await openAI.embeddingQuery(query);
      console.log('Embedding generated successfully');
    } catch (error) {
      console.error('Error generating embedding:', error);
      return res.status(500).json({
        error: 'Failed to process query',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Search Qdrant
    let qdrantContext;
    try {
      qdrantContext = await qdrant.retrieveContext(embeddedQuery);
      console.log('Retrieved Qdrant context:', {
        pointCount: qdrantContext.points.length,
        scores: qdrantContext.points.map(p => p.score)
      });
    } catch (error) {
      console.error('Error searching Qdrant:', error);
      return res.status(500).json({
        error: 'Failed to search session database',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Filter and combine relevant summaries
    const relevantSummaries = qdrantContext.points
      .filter(point => {
        const isRelevant = point.score > 0.20;
        if (!isRelevant) {
          console.log('Filtering out point with low score:', point.score);
        }
        return isRelevant;
      })
      .map(point => {
        if (!point.payload?.summary) {
          console.warn('Found point without summary in payload:', point);
        }
        return point.payload?.summary;
      })
      .join('\n---SUMMARY DELINEATOR---\n');

    if (!relevantSummaries) {
      console.log('No relevant summaries found for query');
      return res.status(404).json({
        error: 'No relevant sessions found for query'
      });
    }

    // Generate final response
    const prompt = `Based only on the session summaries provided below, answer the user's question in a concise manner.\n\n`;
    const data = `User's question: ${query}\nSession summaries:\n${relevantSummaries}`;

    let queryResponse;
    try {
      queryResponse = await openAI.query(prompt, data);
      console.log('Generated response successfully');
    } catch (error) {
      console.error('Error generating response:', error);
      return res.status(500).json({
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return res.status(200).json(queryResponse);

  } catch (error) {
    // Catch-all error handler
    console.error('Unhandled error in chatbot query:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

export default router;