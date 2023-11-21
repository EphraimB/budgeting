# ------ Build stage ------
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Compile TypeScript into JavaScript
RUN npm run build

# ------ Runtime stage ------
FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy compiled JavaScript from the previous stage
COPY --from=builder /app/dist ./

# Copy swagger.json into the dist folder
COPY ./views/swagger.json ./views/swagger.json

# Expose port
EXPOSE 5001

ENV PORT 5001

# Start the app
CMD ["npm", "run", "start"]
