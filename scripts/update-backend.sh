#!/bin/bash

echo "Updating backend..."

# Pull latest changes
git pull origin main

# Rebuild and restart the backend container
echo "Rebuilding backend container..."
docker-compose up -d --build backend

echo "Backend update completed."