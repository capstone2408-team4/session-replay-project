#!/bin/bash

echo "Updating frontend..."

# Pull latest changes
# git pull origin main

# Rebuild and restart the frontend container
echo "Rebuilding frontend container..."
docker-compose up -d --build frontend

echo "Frontend update completed."