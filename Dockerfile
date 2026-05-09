FROM node:lts-bullseye

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
  libpixman-1-dev && \
  apt-get upgrade -y && \
  npm i pm2 -g && \
  rm -rf /var/lib/apt/lists/*

COPY package.json .

RUN yarn install

COPY . .

CMD ["yarn", "start"]
