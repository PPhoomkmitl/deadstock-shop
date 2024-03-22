# Use an official Node.js runtime as a base image
FROM node:lts

# Secure
RUN groupadd -r app && useradd -r -g app app-user

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that your app will run on
EXPOSE 5000

# Define the command to run your application
CMD [ "npm", "start" ]


