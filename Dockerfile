FROM node:20-bullseye

# Install system dependencies for canvas and other media processing
RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp \
  build-essential \
  python3 \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  libpixman-1-dev \
  pkg-config && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies using npm
# We use --build-from-source for canvas if prebuilt binaries fail
RUN npm install

# Copy the rest of the application
COPY . .

# Start the application
CMD ["npm", "start"]
