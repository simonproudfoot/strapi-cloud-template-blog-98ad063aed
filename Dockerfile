FROM node:20-alpine

# Install dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /opt/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose Strapi port
EXPOSE 1337

# Start Strapi
CMD ["npm", "run", "develop"]

