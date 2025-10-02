FROM ubuntu:22.04

# Reset entrypoint
ENTRYPOINT []

# Set working directory
WORKDIR /app

# Install Python, FFmpeg with x264, and deps
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    python3-pip python3-dev \
    ffmpeg \
    libsm6 libxext6 libgl1 libglib2.0-0 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
