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

# Copy swagger.json into the dist folder
COPY ./views/swagger.json ./dist/views/swagger.json

# Copy bree/jobs/scripts into the dist folder
COPY ./bree/jobs/scripts ./dist/bree/jobs/scripts

# ------ Cron job stage ------
FROM node:18-alpine AS cronjob

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only the necessary dependencies for the cron job script
RUN npm ci --only=production

# Copy the cron job script
COPY ./scripts/preload-cron-jobs.sh ./preload-cron-jobs.sh

# Set the script as executable
RUN chmod +x ./preload-cron-jobs.sh

# ------ Runtime stage ------
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies.
RUN npm ci --only=production

# Copy compiled JavaScript from the previous stage
COPY --from=builder /app/dist ./dist

# Copy the cron job script from the cron job stage
COPY --from=cronjob /app/preload-cron-jobs.sh .

# Set the cron job script as executable
RUN chmod +x ./preload-cron-jobs.sh

# Expose port
EXPOSE 5001

ENV PORT 5001

# Run the app
CMD ["npm", "run", "start"]
