# Multi-stage Dockerfile for ml-service
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DATASET_PATH=/app/shared/housing.csv

# Stage 1: Install dependencies
COPY ml-service/requirements.txt .
RUN pip install --no-cache-dir --retries 5 --default-timeout=120 -r requirements.txt

# Stage 2: Prepare code and data
COPY ["docs/House Price Dataset.csv", "/app/shared/housing.csv"]
COPY ml-service/schemas.py .
COPY ml-service/train.py .
COPY ml-service/utils.py .
COPY ml-service/main.py .

# Stage 3: Build model during image creation
RUN python train.py

# Stage 4: Expose port and start service
EXPOSE 8000

# Start the FastAPI service
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
