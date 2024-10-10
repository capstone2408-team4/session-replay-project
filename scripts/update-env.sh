#!/bin/bash

echo "Updating entire environment..."

# Update frontend
./scripts/update-frontend.sh

# Update backend
./scripts/update-backend.sh

echo "Environment update completed."