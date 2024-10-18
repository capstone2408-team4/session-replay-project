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
  async addSession(projectID: string, sessionID: string, session_start: Date): Promise<any> {
    try {
      const result = await this.connection.query(
        'INSERT INTO sessions (project_id, session_id, events_file_name, session_start) VALUES ($1, $2, $3, $4) RETURNING *',
        [1, sessionID, `${sessionID}-events.txt`, session_start]
      );
      return result.rows[0];
    } catch (error) {
      console.error(`Error adding session ${sessionID} to PSQL`, error);
      throw error;
    }
  }
}

// CREATE TABLE sessions (
//   id PK SERIAL,
//   project_id FK INTEGER NOT NULL,
//   session_id VARCHAR(255),
//   events_file_name VARCHAR (255) NOT NULL,
//   session_summary VARCHAR (5000),                           
//   session_start TIMESTAMP NOT NULL,
//   session_end TIMESTAMP
// );