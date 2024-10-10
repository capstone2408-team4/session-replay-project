#!/bin/bash

echo "Resetting Redis + RedisStack for session replay project..."

echo "Stopping Redis container..."
docker-compose stop redis

echo "Removing Redis volume..."
docker volume rm session-replay-project_redis_data

echo "Restarting Redis container..."
docker-compose up -d redis

echo "Redis + RedisStack reset completed successfully."
echo "Any previously stored data in Redis has been cleared."