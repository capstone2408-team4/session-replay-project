# Development stage
FROM node:20 AS development

WORKDIR /app
COPY backend/package.json ./
RUN npm install

COPY backend/ ./

# Rebuild bcrypt
RUN npm rebuild bcrypt --build-from-source

# Start in development mode with hot reloading
CMD node /app/src/migrations/initPostgres.js && npm run dev

# Frontend build stage (for production)
FROM node:20 AS frontend-builder

WORKDIR /frontend
COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Backend build stage (for production)
FROM node:20 AS backend-builder

WORKDIR /app
COPY backend/package.json ./
RUN npm install

COPY backend/ ./
RUN npm run build || echo "Backend built with TS errors. Continuing."

# Rebuild bcrypt
RUN npm rebuild bcrypt --build-from-source

# Production stage
FROM node:20 AS production

WORKDIR /app

# Copy built backend files
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/package*.json ./
RUN npm ci --only=production

# Copy built frontend static files
COPY --from=frontend-builder /frontend/dist /app/public

# Start production server using compiled javascript
CMD node /app/dist/migrations/initPostgres.js && npm start