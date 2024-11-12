FROM node:20 AS development

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Start Vite dev server with hot reloading
CMD ["npm", "run", "dev"]