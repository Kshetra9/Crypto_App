# Use the official Node.js image as a base image
FROM node:latest

# Create a new directory for the app
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

ENV REACT_APP_BACKEND_URL=http://3.218.247.215:8080

# Copy the rest of the application code
COPY . .

# Copy the .env file
#COPY .env .

# Build the React application
RUN npm run build

# Install a lightweight HTTP server
RUN npm install -g serve

# Set the startup command to serve the built app
CMD ["serve", "-s", "build"]
