import pkg from 'pg';
const { Pool } = pkg;

// Configure your database connection
const pool = new Pool({
  user: process.env.PSQL_USER,
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DB_NAME,
  password: process.env.PSQL_PASSWORD,
  port: process.env.PSQL_PORT
});

// Function to initalize the database
async function initalizeDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255)
      );
    `);

    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        project_id VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        session_summary TEXT,
        session_start TIMESTAMP WITH TIME ZONE NOT NULL,
        session_end TIMESTAMP WITH TIME ZONE,
        last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_active BOOLEAN NOT NULL,
        CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id)
      );
    `);

    await client.query('COMMIT');
    console.log('Database initialized successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
}

// Run the initialization
initalizeDatabase().catch(err => console.error(err))
  .finally(() => pool.end());