FROM node:8-alpine

WORKDIR /src

# The official image has verbose logging; change it to npm's default
ENV NPM_CONFIG_LOGLEVEL notice

# Add PM2, for Node process management
RUN npm i -g pm2

# Add NPM package config
ADD package*.json ./

# Install everything (and clean up afterwards)
RUN apk add --no-cache --virtual .gyp \
    autoconf \
    automake \
    g++ \
    libpng-dev \
    libtool \
    make \
    nasm \
    python \
    git \
  && npm i \
  && apk del .gyp

# Add the remaining project files
ADD . .

# Set the default host/port
ENV HOST 0.0.0.0
ENV PORT 4000

# Build distribution
RUN npm run build

# Start the server by default
CMD pm2-docker start dist/server.js -i max
