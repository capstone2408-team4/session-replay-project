import Redis from 'ioredis'; // NPM package providing redis functionality
import config from '../config/environment.js';

// Provides functionality to interact with the redis database.
export class RedisService {
  private connection: Redis;

  constructor() {
    this.connection = new Redis(config.REDIS.URL as string);
  }

  // Pull recording data from redis
  async getRecording(key: string): Promise<any[]> {
    try {
      const data = await this.connection.call('JSON.GET', key);
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error retrieving events for ${key} from Redis:`, error);
      throw error;
    }
  }

  // Add recording data to redis. If key exists, append data. If not, create it
  async addRecording(key: string, value: any[]): Promise<void> {
    const keyExists = await this.sessionExists(key);
    if (keyExists) {
      console.log(`Redis session for ${key} found. Appending ${value.length} events...`);
      await this.appendRecording(key, value);
    } else {
      console.log(`Redis session for ${key} not found. Creating with ${value.length} events...`);
      await this.createRecording(key);
      await this.appendRecording(key, value)
    }
  }

  // Does the key exist?
  async sessionExists(key: string): Promise<boolean> {
    try {
      const data = await this.connection.call('JSON.GET', key);
      return !!data;
    } catch (error) {
      console.error(`Error checking Redis for session ${key}:`, error);
      throw error;
    }
  }

  async deleteRecording(key:string): Promise<void> {
    try {
      await this.connection.call('JSON.DEL', key)
      console.log(`Events for session ${key} deleted from Redis`)
    } catch (error) {
      console.error(`Error deleting events for session ${key} from Redis`, error)
      throw error;
    }
  }


  // Private method only to be called by addRecording
  private async appendRecording(key: string, value: any[]): Promise<void> {
    try {
      await this.connection.call('JSON.ARRAPPEND', key, '$', ...value.map(event => JSON.stringify(event)));
      console.log(`Events appended to session ${key} in Redis`);
    } catch (error) {
      console.error(`Error appending events for session ${key} in Redis`, error);
      throw error;
    }
  }

  // Private method only to be called by addRecording
  private async createRecording(key: string): Promise<void> {
    try {
      await this.connection.call('JSON.SET', key, '$', '[]');
      console.log(`Redis session for ${key} created`);
    } catch (error) {
      console.error(`Error creating session for ${key} in Redis`, error);
      throw error;
    }
  }
}
