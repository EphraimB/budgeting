# ------ Build stage ------
FROM node:22-alpine AS builder

# Set the working directory
WORKDIR /home/node/app

# Install app dependencies by copying package.json and package-lock.json
COPY package*.json ./
RUN npm install && npm cache clean --force

# Bundle app source by copying the rest of your application code
COPY . .

# Compile TypeScript into JavaScript
RUN npm run build

# ------ Runtime stage ------
FROM node:22-alpine

# Set the working directory to match the Docker Compose setup
WORKDIR /home/node/app

# Install nodemon globally if in development
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; then npm install -g nodemon; fi

# Copy package.json and package-lock.json for production dependency installation
COPY package*.json ./

# Install app dependencies based on environment
RUN if [ "$NODE_ENV" = "development" ]; then npm install; else npm ci --only=production; fi

# Copy compiled JavaScript and other necessary files from the build stage
COPY --from=builder /home/node/app/src/dist ./

# Copy swagger.json
COPY ./swagger.json ./swagger.json

# Expose the port the app runs on
EXPOSE 5001

# Set the environment variable for the port
ENV PORT 5001

# Start the app with nodemon in development, or node for production
CMD if [ "$NODE_ENV" = "development" ]; then nodemon src/server.js; else node src/server.js; fi
