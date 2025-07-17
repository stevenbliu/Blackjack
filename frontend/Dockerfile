# Frontend Dockerfile

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install --save-dev @vitejs/plugin-react @vitejs/plugin-react-swc

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]