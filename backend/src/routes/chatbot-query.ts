import express from 'express';
import { QdrantService } from '../services/qdrantService';
import { OpenAIService } from '../services/openAIService';

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
    .map(point => point.payload && point.payload.summary) // take out after cleaning the db
    .join('\n---SUMMARY DELINEATOR---\n');

  // send relevant summaries + new prompt to openAI
  const prompt = `Based only on the session summaries provided below, answer the user's question in a concise manner.\n\n`;
  const data = `User's question: ${query}\nSession summaries:\n${relevantSummaries}`;

  const queryResponse = await openAI.query(prompt, data);
  res.status(200).json(queryResponse);
});

export default router;