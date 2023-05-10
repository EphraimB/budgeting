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
EXPOSE 5001

# Start the server
CMD ["npm", "start"]