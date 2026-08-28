# ==============================================================================
# Expensus — Frontend Dockerfile (Vite + React + TypeScript)
# ==============================================================================
FROM node:20-alpine

WORKDIR /app

# Install dependencies (utilizing Docker layer caching)
COPY package*.json ./
RUN npm install

# Copy frontend source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server with host exposed for container network access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
