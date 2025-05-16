FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose API port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
