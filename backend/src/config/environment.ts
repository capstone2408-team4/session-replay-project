const config = {
  PORT: process.env.API_PORT,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  REDIS: {
    URL: process.env.REDIS_URL,
  },
  
  POSTGRESQL: {
    HOST: process.env.PSQL_HOST,
    PORT: process.env.PSQL_PORT,
    USER: process.env.PSQL_USER,
    PASSWORD: process.env.PSQL_PASSWORD,
    DATABASE: process.env.PSQL_DB_NAME,
  },
  
  S3: {
    ENDPOINT: process.env.S3_ENDPOINT,
    ACCESS_KEY: process.env.S3_ACCESS_KEY,
    SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    BUCKET_NAME: process.env.S3_BUCKET_NAME,
    REGION: process.env.S3_REGION,
  },
};

export default config;