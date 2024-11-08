import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';

const pool = new Pool({
  user: process.env.PSQL_USER,
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DB_NAME,
  password: process.env.PSQL_PASSWORD,
  port: process.env.PSQL_PORT
});

async function initalizeDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        project_id VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        session_summary TEXT,
        session_start TIMESTAMP WITH TIME ZONE NOT NULL,
        session_end TIMESTAMP WITH TIME ZONE,
        last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id)
      );
    `);

    // Root project setup
    const rootName = process.env.PROVIDENCE_ROOT_USERNAME;
    const rootPassword = process.env.PROVIDENCE_ROOT_PASSWORD;

    if (!rootName || !rootPassword) {
      throw new Error('Root project credentials not found in environment variables');
    }

    const existingRoot = await client.query(
      'SELECT * FROM projects WHERE name = $1',
      [rootName]
    );

    if (existingRoot.rows.length === 0) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(rootPassword, saltRounds);
      const rootId = crypto.randomUUID();

      await client.query(
        'INSERT INTO projects (id, name, password_hash) VALUES ($1, $2, $3)',
        [rootId, rootName, passwordHash]
      );

      console.log(`Root project initialized with name:`, rootName);
    }

    await client.query('COMMIT');
    console.log('Database initialized successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
}

initalizeDatabase().catch(err => console.error(err))
  .finally(() => pool.end());