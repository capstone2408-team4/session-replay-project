#!/bin/bash

echo "Resetting PostgreSQL database for session replay project..."

echo "Stopping PostgreSQL container..."
docker-compose stop postgres

echo "Removing PostgreSQL volume..."
docker volume rm session-replay-project_postgres_data

echo "Restarting PostgreSQL container..."
docker-compose up -d postgres

echo "PostgreSQL database reset completed successfully."
echo "You may need to run any database migrations or seed scripts."