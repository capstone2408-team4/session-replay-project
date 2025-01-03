const config = {
  PORT: process.env.API_PORT,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  FINDIP_API_KEY: process.env.FINDIP_API_KEY,

  JWT: {
    SECRET: process.env.JWT_SECRET,
    EXPIRES_IN: '24h'
  },

  COOKIE: {
    NAME: 'providence_auth',
    SECURE: process.env.NODE_ENV === 'production',
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours in ms
    // DOMAIN: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost',
    SAME_SITE: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    HTTP_ONLY: true
  },

  QDRANT: {
    HOST: process.env.QDRANT_HOST,
    PORT: process.env.QDRANT_PORT,
    QDRANT_API_KEY: process.env.QDRANT_API_KEY
  },
  
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