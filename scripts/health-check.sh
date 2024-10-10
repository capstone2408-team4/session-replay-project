#!/bin/bash

echo "Checking Frontend (React app)..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
echo ""

echo "Checking Backend (Express server)..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:5001
echo ""

echo "Checking PostgreSQL..."
nc -zv localhost 5432 2>&1

echo "Checking Redis..."
nc -zv localhost 6379 2>&1

echo "Checking Redis Insight Console..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8001
echo ""

echo "Checking MinIO..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:9000/minio/health/live
echo ""

echo "Checking MinIO Console..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:9001
echo ""

echo "Health check completed."