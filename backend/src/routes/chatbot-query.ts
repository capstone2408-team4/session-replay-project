import express from 'express';
import { QdrantService } from '../services/qdrantService';
import { OpenAIService } from '../services/openAIService';
import { ChatbotSystemPrompt, ChatbotUserPrompt } from '../utils/aiModelsConfig';

const router = express.Router();

const qdrant = new QdrantService();
const openAI = new OpenAIService();

router.post('/', async (req, res) => {
  // extract the query from the request body  
  const { query }  = req.body; // might need to stringify the query

  // Turn query into embedding
  const embeddedQuery = await openAI.embeddingQuery(query);

  // perform similarity search with embedding
  const qdrantContext = await qdrant.retrieveContext(embeddedQuery);

  // piece the summaries together summaries together
  let relevantSummaries = qdrantContext.points
    .filter(point => point.score > 0.20)
    .map(point => {
      return `---SESSION START (ID: ${point.id})---\n` +
             `Similarity Score: ${point.score.toFixed(3)}\n` +
             `Summary: ${point.payload.summary}\n` +
             `---SESSION END---`;
    })
    .join('\n\n');

  // send relevant summaries + new prompt to openAI
  const data = `Question: "${query}"\n\nSummaries:\n\n${relevantSummaries}`;

  const queryResponse = await openAI.query(ChatbotSystemPrompt, ChatbotUserPrompt, data);
  res.status(200).json(queryResponse);
});

export default router;