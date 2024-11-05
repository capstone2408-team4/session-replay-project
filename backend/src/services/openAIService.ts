import OpenAI from 'openai'; // From OpenAI SDK
import AIParent from '../models/AIParent';
import * as AIConfig from '../utils/aiModelsConfig'; // Import configuration values for OpenAI LLM.
import config from '../config/environment';

// Provides functionality to interact with Open AI
export class OpenAIService extends AIParent {
  private connection: OpenAI;
  private model: string;
  private embeddingModel: string;
  protected maxPromptLength: number;

  constructor() {
    super();
    this.connection = new OpenAI({
      apiKey: config.OPENAI_API_KEY
    });
    this.model = AIConfig.OpenAIModel;
    this.maxPromptLength = AIConfig.OpenAIMaxPromptLength;
    this.embeddingModel = AIConfig.EmbeddingModel;
  }

  // query the model
  async query(prompt: string, data: string): Promise<string> {
    try {
      const response = await this.connection.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "user",
            content: `${prompt} ${data}`,
          }
        ],
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('OpenAI query error:', error);
      return '';
    }
  }

  async embeddingQuery(text: string) {
    const response = await this.connection.embeddings.create({ model: this.embeddingModel, input: text, encoding_format: 'float' });
    return response.data[0].embedding;
  }
}
