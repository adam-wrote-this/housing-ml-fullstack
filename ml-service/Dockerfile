# Multi-stage Dockerfile for ml-service
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# Stage 1: Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Prepare code and data
COPY housing.csv .
COPY schemas.py .
COPY train.py .
COPY utils.py .
COPY main.py .

# Stage 3: Build model during image creation
RUN python train.py

# Stage 4: Expose port and start service
EXPOSE 8000

# Start the FastAPI service
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
