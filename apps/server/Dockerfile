# Base image for building the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package configuration and lockfile
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the NestJS application
RUN npm run build

# Production stage to keep image size small
FROM node:20-alpine AS runner

WORKDIR /app

COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main"]
