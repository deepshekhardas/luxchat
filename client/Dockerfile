# Use official Node.js lightweight image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Vite port
EXPOSE 5173

# Start Vite with --host to expose to localhost
CMD ["npm", "run", "dev", "--", "--host"]
