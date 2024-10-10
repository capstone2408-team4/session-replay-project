#!/bin/bash

echo "Resetting MinIO (S3) storage for session replay project..."

echo "Stopping MinIO container..."
docker-compose stop minio

echo "Removing MinIO volume..."
docker volume rm session-replay-project_minio_data

echo "Restarting MinIO container..."
docker-compose up -d minio

echo "MinIO (S3) storage reset completed successfully."
echo "You may need to recreate any buckets or upload initial data."