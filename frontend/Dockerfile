# --- Build Stage ---
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# --- Production Stage ---
FROM nginx:alpine

# Copy the built assets to Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: custom nginx config (if needed)
COPY nginx.conf.prod /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
# CMD ["npm", "run", "dev"]
