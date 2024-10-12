import { Pool } from 'pg';
import config from '../config/environment';

// Provides functionality to interact with the PSQL database.
export class PsqlService {
  private connection: Pool;

  constructor() {
    this.connection = new Pool({
      user: config.POSTGRESQL.USER,
      host: config.POSTGRESQL.HOST,
      database: config.POSTGRESQL.DATABASE,
      password: config.POSTGRESQL.PASSWORD,
      port: config.POSTGRESQL.PORT,
      ssl: {
        rejectUnauthorized: false, // Use this if your RDS instance requires SSL and you're testing locally
      },
    });
  }

  // Get session metadata
  async getSession(id: string): Promise<any[]> {
    try {
      const result = await this.connection.query('SELECT * FROM sessions WHERE session_id = $1', [id]);
      return result.rows;
    } catch (error) {
      console.error(`Error fetching session ${id} from PSQL`, error);
      throw error;
    }
  }

  // To be changed for actual data, but this is the code to insert data into psql. 
  async addSession(id: string, data: any): Promise<any> {
    try {
      const result = await this.connection.query(
        'INSERT INTO sessions (session_id, recording_data) VALUES ($1, $2) RETURNING *',
        [Math.floor(Math.random() * 1000), JSON.stringify({ example: 'data' })]
      );
      return result.rows[0];
    } catch (error) {
      console.error(`Error adding session ${id} to PSQL`, error);
      throw error;
    }
  }
}