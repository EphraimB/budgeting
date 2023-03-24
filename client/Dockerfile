# Specify the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy over the application code
COPY . .

# Expose the necessary port
EXPOSE 3000

# Start the client
CMD ["npm", "run", "dev"]