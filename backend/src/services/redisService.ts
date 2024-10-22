import Redis from 'ioredis'; // NPM package providing redis functionality
import config from '../config/environment';

// Provides functionality to interact with the redis database.
export class RedisService {
  private connection: Redis;

  constructor() {
    this.connection = new Redis(config.REDIS.URL as string);
  }

  // Pull recording data from redis
  async getRecording(key: string): Promise<string | unknown> {
    try {
      const data = await this.connection.call('JSON.GET', key);
      return data;
    } catch (error) {
      console.error(`Error retrieving events for ${key} from Redis:`, error);
      throw error;
    }
  }

  // Add recording data to redis. If key exists, append data. If not, create it
  async addRecording(key: string, value: string): Promise<void> {
    const keyExists = await this.sessionExists(key);
    if (keyExists) {
      console.log(`Redis session for ${key} found. Appending...`);
      await this.appendRecording(key, value);
    } else {
      console.log(`Redis session for ${key} not found. Creating...`);
      await this.createRecording(key, value);
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
  private async appendRecording(key: string, value: string): Promise<void> {
    try {
      await this.connection.call('JSON.ARRAPPEND', key, '.', value);
      console.log(`Additional events appended for session ${key} in Redis`);
    } catch (error) {
      console.error(`Error appending events for session ${key} in Redis`, error);
      throw error;
    }
  }

  // Private method only to be called by addRecording
  private async createRecording(key: string, value: string): Promise<void> {
    try {
      await this.connection.call('JSON.SET', key, '.', value);
      console.log(`Events for session ${key} added to Redis`);
    } catch (error) {
      console.error(`Error adding events for session ${key} to Redis`, error);
      throw error;
    }
  }
}
