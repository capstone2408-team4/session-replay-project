import pkg from 'pg';
const { Pool } = pkg;
import type { Pool as PoolType } from 'pg';
import bcrypt from 'bcrypt';
import config from '../config/environment.js';

interface SummaryRow {
  session_summary: string;
}
export class PsqlService {
  private connection: PoolType;

  constructor() {
    this.connection = new Pool({
      user: config.POSTGRESQL.USER,
      host: config.POSTGRESQL.HOST,
      database: config.POSTGRESQL.DATABASE,
      password: config.POSTGRESQL.PASSWORD,
      port: Number(config.POSTGRESQL.PORT),
      ssl: false
    });
  }

  async getProject(projectID: string): Promise<any[]> {
    try {
      const result = await this.connection.query('SELECT * FROM projects WHERE id = $1', [projectID]);
      return result.rows[0];
    } catch (error) {
      console.error(`Error fetching project ${projectID} metadata from PSQL`, error);
      throw error;
    }
  }

  async getActiveSession(sessionID: string): Promise<any[]> {
    try {
      const result = await this.connection.query('SELECT * FROM sessions WHERE session_id = $1 AND is_active = TRUE', [sessionID]);
      return result.rows[0];
    } catch (error) {
      console.error(`Error fetching active session metadata ${sessionID} from PSQL`, error);
      throw error;
    }
  }

  async addSession(projectID: string, sessionID: string, sessionStart: string): Promise<any> {
    try {
      const result = await this.connection.query(
        'INSERT INTO sessions (project_id, session_id, file_name, session_start, last_activity_at) VALUES ($1, $2, $3, $4, $5)',
        [projectID, sessionID, `${sessionID}-${sessionStart}.txt`, sessionStart, sessionStart]
      );
      console.log(`Session metadata created for ${sessionID} in PSQL`);
      return result.rows[0];
    } catch (error) {
      console.error(`Error creating metadata for ${sessionID} in PSQL`, error);
      throw error;
    }
  }

  async updateSessionLastActivity(sessionID: string, timestamp: string): Promise<void> {
    try {
      await this.connection.query(
        'UPDATE sessions SET last_activity_at = $1 WHERE is_active = TRUE AND session_ID = $2',
        [timestamp, sessionID]
      );
      console.log(`Session metadata updated for ${sessionID} in PSQL`);
    } catch (error) {
      console.error(`Error updating session metadata for ${sessionID} in PSQL`, error);
      throw error;
    }
  }

  async getCompletedSessions(projectID: string): Promise<any> {
    try {
      const result = await this.connection.query(
        'SELECT * FROM sessions WHERE is_active = FALSE AND project_id = $1',
        [projectID]
      );
      return result.rows;
    } catch (error) {
      console.error(`Error fetching completed sessions for project ${projectID} from PSQL`, error);
      throw error;
    }
  }

  async getInactiveSessions(cutoffTime: string): Promise<any> {
    try {
      const result = await this.connection.query(
        'SELECT * FROM sessions WHERE last_activity_at < $1 AND session_end IS NULL',
        [cutoffTime]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching inactive sessions from PSQL', error);
      throw error;
    }
  }
  
  async endSession(sessionID: string, timestamp: string): Promise<void> {
    try {
      await this.connection.query(
        'UPDATE sessions SET session_end = $2, is_active = FALSE WHERE session_id = $1 AND is_active = TRUE',
        [sessionID, timestamp]
      );
      console.log(`End metadata set for session ${sessionID} in PSQL`);
    } catch (error) {
      console.error(`Error ending session ${sessionID} in PSQL`, error);
      throw error;
    }
  }

  async addSessionSummary(sessionID: string, summary: string): Promise<void> {
    try {
      await this.connection.query(
        'UPDATE sessions SET session_summary = $2 WHERE session_id = $1 AND is_active = TRUE',
        [sessionID, summary]
      );
      console.log(`Successfully added a summary for ${sessionID} in PSQL`)
    } catch (error) {
      console.error(`Error adding session summary for ${sessionID} in PSQL`)
      throw error;
    }
  }

  async getSummaries(sessionIds: Number[]): Promise<SummaryRow[]> {
    console.log('TYPE OF FIRST SESSION ID:', typeof sessionIds[0]);
    try {
      const summaries = await this.connection.query(
        'SELECT session_summary FROM sessions WHERE id = ANY($1);',
        [sessionIds]
      );
      return summaries.rows;
    } catch(error) {
      console.error('Error fetching multi summaries:', error);
      throw error;
    }
  }

  async validateProjectLogin(projectName: string, password: string): Promise<{ valid: boolean; projectID?: string }> {
    try {
      const result = await this.connection.query(
        'SELECT id, password_hash FROM projects WHERE name = $1',
        [projectName]
      );

      if (result.rows.length === 0) {
        return { valid: false };
      }

      const { id, password_hash } = result.rows[0];
      const passwordValid = await bcrypt.compare(password, password_hash);

      return {
        valid: passwordValid,
        projectID: passwordValid ? id : undefined
      };
    } catch (error) {
      console.error('Error validating project login:', error);
      throw error;
    }
  }
}
