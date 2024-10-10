# Base stage for both development and production
FROM node:20 as base

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Development stage
FROM base as development

# Install all dependencies (including devDependencies)
RUN npm install

# Copy the rest of the code
COPY . .

EXPOSE 5001

CMD ["npm", "run", "dev"]

# Production stage (if needed in the future)
# FROM base as production

# Install only production dependencies
# RUN npm ci --only=production

# Copy the rest of the code
# COPY . .

# EXPOSE 5001

# CMD ["npm", "start"]