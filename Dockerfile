# Backend Dockerfile

# Build frontend
# FROM node:20-alpine AS frontend-build
FROM python:3.11-slim

WORKDIR /app


# COPY frontend/package*.json ./
# RUN npm install
# COPY frontend/ ./frontend/
# RUN npm run build


# Backend

COPY backend/ ./backend

RUN pip install --no-cache-dir -r backend/requirements.txt

# COPY --from=frontend-build /frontend/dist ./dist
COPY /frontend/dist ./frontend/dist

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", '--reload']