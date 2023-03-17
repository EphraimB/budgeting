# Specify the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy over the application code
COPY . .

# Build the client
RUN npm run build

# Expose the necessary port
EXPOSE 3000

# Start the client
CMD ["npm", "start"]