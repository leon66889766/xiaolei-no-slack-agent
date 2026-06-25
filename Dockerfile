# Stage 1: Build the application
FROM node:18-alpine AS builder

# Install necessary build tools for native modules like better-sqlite3
# python3, make, and g++ are required for node-gyp
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
# Use npm ci for reproducible builds
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production environment
FROM node:18-alpine AS runner

WORKDIR /app

# Set the environment to production
ENV NODE_ENV=production

# Copy the standalone output
COPY --from=builder /app/.next/standalone ./

# Copy the public and .next/static folders
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
