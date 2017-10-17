FROM node:8-alpine

WORKDIR /src

# The official image has verbose logging; change it to npm's default
ENV NPM_CONFIG_LOGLEVEL notice

# Set the default host/port
ENV HOST 0.0.0.0
ENV PORT 4000

# Start the server by default
CMD npm run server

ADD package.json package-lock.json ./

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
  && npm install \
  && apk del .gyp

# Add the remaining project files
ADD . .

# Build distribution
RUN npm run build
