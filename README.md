# Session Replay Project

# (WIP)

## Prerequisites

- Docker
- Node.js v20+
- Git

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/providence-replay/providence.git
   cd providence
   ```

2. Copy the example environment file:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file and set environment variables.

3. Login to Docker:
   ```
   docker login -u <username>
   ```

4. Build and start the Docker containers:
   ```
   docker-compose up -d
   ```

## Useful Scripts
- `./scripts/update-frontend.sh`: Rebuilds frontend container with latest changes in /frontend folder.
- `./scripts/update-backend.sh`: Rebuilds backend container with latest changes in /backend folder.
- `./scripts/update-env.sh`: Rebuilds both frontend and backend containers.
- `./scripts/reset-postgres.sh`: Resets the PostgreSQL database.
- `./scripts/reset-minio.sh`: Resets the MinIO (S3) storage.
- `./scripts/reset-redis.sh`: Resets Redis + RedisStack.
- `./scripts/health-check.sh`: Polls each container service.
