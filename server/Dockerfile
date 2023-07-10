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

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

# Create directory for cron jobs
RUN mkdir -p /etc/cron.d

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
RUN echo "0 0 1 * * /bin/sh /app/dist/scripts/cronScriptCheckEmployees.sh" >> /etc/crontabs/root

# Expose port
EXPOSE 5001

ENV PORT 5001

# Run the app
CMD ["npm", "run", "start"]
