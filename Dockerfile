# Dockerfile for PulseMed Web (Next.js marketing site)
FROM node:20.11.0-alpine

WORKDIR /app/web

# Copy package files
COPY web/package.json web/package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy web app source
COPY web/ ./

# Build the Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
