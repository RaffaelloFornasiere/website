# Stage 1: Build the Angular app
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Production image with Node.js server and built Angular app
FROM node:20-slim
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy the server file and credentials
COPY server.js ./
COPY credentials.json ./

# Copy the built Angular app from the build stage
COPY --from=build /app/dist ./dist

# Expose port 3000 for the Node.js server
EXPOSE 3000

# Start the Node.js server
CMD ["node", "server.js"]