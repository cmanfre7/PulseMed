# Dockerfile for PulseMed Web (Next.js marketing site)
# Root Directory in Railway should be set to: web/
FROM node:20.11.0-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source
COPY . ./

# Build the Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
