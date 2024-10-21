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

  // Get project metadata
  async getProject(projectID: string): Promise<any[]> {
    try {
      const result = await this.connection.query('SELECT * FROM projects WHERE id = $1', [projectID]);
      return result.rows[0];
    } catch (error) {
      console.error(`Error fetching project ${projectID} from PSQL`, error);
      throw error;
    }
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
  async addSession(projectID: string, sessionID: string, sessionStart: string): Promise<any> {
    try {
      const result = await this.connection.query(
        'INSERT INTO sessions (project_id, session_id, events_file_name, session_start, last_activity_at) VALUES ($1, $2, $3, $4, $5)',
        [projectID, sessionID, `${sessionID}-events.txt`, sessionStart, sessionStart]
      );
      return result.rows[0];
    } catch (error) {
      console.error(`Error adding session ${sessionID} to PSQL`, error);
      throw error;
    }
  }

  async updateSessionMetadata(sessionID: string, timestamp: string): Promise<void> {
    try {
      await this.connection.query(
        'UPDATE sessions SET last_activity_at = $1 WHERE is_active = t AND session_ID = $2',
        [timestamp, sessionID]
      )
    } catch (error) {
      console.error(`Error updating session metadata for ${sessionID}`, error);
      throw error;
    }
  }

  async getInactiveSessions(cutoffTime: string): Promise<any> {
    try {
      const result = await this.connection.query(
        'SELECT id FROM sessions WHERE last_activity_at < $1 AND session_end IS NULL',
        [cutoffTime]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching inactive sessions', error);
      throw error;
    }
  }
  
  async endSession(sessionId: string, timestamp: string): Promise<void> {
    try {
      await this.connection.query(
        'UPDATE sessions SET session_end = $2 WHERE id = $1',
        [sessionId, timestamp]
      );
    } catch (error) {
      console.error(`Error ending session ${sessionId}`, error);
      throw error;
    }
  }
}
  
// id                                        |              project_id              |                    file_name                    | session_summary |       session_start        |        session_end         |      last_activity_at      | is_active 
// --------------------------------------+--------------------------------------+-------------------------------------------------+-----------------+----------------------------+----------------------------+----------------------------+-----------
// 1 // 217e3db2-029a-49b6-a69c-e242aa48f401 | cfc15e83-970b-42cd-989f-b87b785a1fd4 | 217e3db2-029a-49b6-a69c-e242aa48f401-events.txt |                 | 2024-10-21 03:30:36.981+00 | 2024-10-21 03:51:59.395+00 | 2024-10-21 04:02:16.952+00 | t
// 2 // bf71169b-1ab4-47db-903c-fdb72698e4a0 | cfc15e83-970b-42cd-989f-b87b785a1fd4 | bf71169b-1ab4-47db-903c-fdb72698e4a0-events.txt |                 | 5pm                        |                            | 5:14PM                     | t
// 3 // bf71169b-1ab4-47db-903c-fdb72698e4a0 | cfc15e83-970b-42cd-989f-b87b785a1fd4 | bf71169b-1ab4-47db-903c-fdb72698e4a0-events.txt |                 | 2024-10-21 04:02:36.167+00 | 2024-10-21 04:13:15.529+00 | 2024-10-21 04:26:11.179+00 | t
