# Backend Dockerfile

# Build frontend
# FROM node:20-alpine AS frontend-build

# WORKDIR /frontend
# COPY frontend/package*.json ./
# RUN npm install
# COPY frontend/ ./
# RUN npm run build


# Backend
FROM python:3.11-slim
WORKDIR /app

# COPY backend/ ./

# COPY --from=frontend-build /frontend/dist ./dist


RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]