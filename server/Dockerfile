# ------ Build stage ------
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Compile TypeScript into JavaScript
RUN npm run build

# Copy scripts folder into the dist folder
COPY ./scripts /app/scripts

# Make all files in the scripts directory executable
RUN chmod +x /app/scripts/*

# ------ Runtime stage ------
FROM node:18-alpine

# Set global environment variables for cron
ENV SHELL=/bin/sh
ENV PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy compiled JavaScript from the previous stage
COPY --from=builder /app/dist ./

# Copy scripts from the previous stage
COPY --from=builder /app/scripts ./scripts

# Copy swagger.json into the dist folder
COPY ./views/swagger.json ./views/swagger.json

# Expose port
EXPOSE 5001

ENV PORT 5001
