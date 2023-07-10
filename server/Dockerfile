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

# Copy scripts folder into the dist folder
COPY ./scripts /app/dist/scripts

# Make all files in the scripts directory executable
RUN chmod +x /app/dist/scripts/*

# ------ Runtime stage ------
FROM node:18-alpine

# Install PostgreSQL client and other necessary utilities
RUN apk add --no-cache postgresql-client util-linux

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy compiled JavaScript from the previous stage
COPY --from=builder /app/dist ./dist

# Copy scripts from the previous stage
COPY --from=builder /app/dist/scripts ./dist/scripts

# Add the cron job to the system crontab
RUN echo "0 0 1 * * /app/dist/scripts/employeeChecker.sh > /app/logfile.log 2>&1" >> /var/spool/cron/crontabs/root

# Start the cron service and run the app
CMD crond -l 2 -b && npm run start

# Expose port
EXPOSE 5001

ENV PORT 5001
