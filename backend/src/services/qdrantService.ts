import config from '../config/environment';
import { QdrantClient } from "@qdrant/js-client-rest";
import { EmbeddingDimensions } from '../utils/aiModelsConfig';

export class QdrantService {
  private connection: QdrantClient
  private collection: string
  
  constructor() {
    this.connection = new QdrantClient({
      url: `http://${config.QDRANT.HOST}`,
      port: config.QDRANT.PORT,
      apiKey: config.QDRANT.QDRANT_API_KEY
    });   
    this.collection = 'providence';
    this.createCollection(this.collection, EmbeddingDimensions);
  }
  
  async createCollection(name: string, dimensionality: number, algorithm="Dot") {
    try {
      const response = await this.connection.collectionExists(this.collection);
      if (response.exists) {
        console.log(`Collection ${this.collection} already exists`);
      } else {
        await this.connection.createCollection(name, {vectors: {size: dimensionality, distance: algorithm}});
      }
    } catch (error) {
      console.error(`Error creating/searching for existing collection ${this.collection}`, error);
      throw error;
    }
  }

  async addVector(vector: number[], id, payload=null) {
    await this.connection.upsert(
      this.collection,
      {
        wait: true,
        // amend id below
        points: [{id: id, vector: vector, payload: payload}]
    })
  }
  
  //  can decide to add filters here if we want
  async retrieveContext(vector: number[], limit: number) {
    const context = await this.connection.query(
      this.collection,
      { query: vector,
        limit: limit,
        with_payload: true
      });
    return context;
  }
}  