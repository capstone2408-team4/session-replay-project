import Redis from 'ioredis';
import config from '../config/environment.js';

export class RedisService {
  private connection: Redis;

  constructor() {
    this.connection = new Redis(config.REDIS.URL as string);
  }

  async getRecording(key: string): Promise<any[]> {
    try {
      const data = await this.connection.call('JSON.GET', key);
      if (data === null) {
        throw new Error(`Key "${key}" does not exist in Redis`);
      }
      return JSON.parse(data as string);
    } catch (error) {
      console.error(`Error retrieving events for ${key} from Redis:`, error);
      throw error;
    }
  }

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

  private async appendRecording(key: string, value: any[]): Promise<void> {
    try {
      await this.connection.call('JSON.ARRAPPEND', key, '$', ...value.map(event => JSON.stringify(event)));
      console.log(`Events appended to session ${key} in Redis`);
    } catch (error) {
      console.error(`Error appending events for session ${key} in Redis`, error);
      throw error;
    }
  }

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
