# ---- Base stage ----
FROM node:22-alpine AS base
# Install required dependencies
RUN apk add --no-cache g++ make py3-pip libc6-compat && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
# Set the working directory
WORKDIR /home/node/app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Expose the app's port
EXPOSE 3000

# ---- Development or Build stage ----
FROM base AS build
# Copy source code
COPY . .
# Install dependencies (for both dev and prod)
RUN npm install

# If building for production, run the Next.js build command
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

# ---- Final stage ----
FROM base AS final
# Set NODE_ENV (will be overridden by environment variables if passed)
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

# Install production dependencies if in production
RUN if [ "$NODE_ENV" = "production" ]; then npm ci --only=production; fi

# Copy the necessary files from the build stage
COPY --from=build /home/node/app /home/node/app

# Start the app based on environment
CMD if [ "$NODE_ENV" = "development" ]; then npm run dev; else npm start; fi
