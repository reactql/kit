FROM debian:testing-slim

ENV EPHIMERAL_PACKAGES "build-essential dh-autoreconf curl xz-utils python git"
ENV PACKAGES "libpng-dev git"

# Install apt packages (and clean up afterwards)
RUN apt-get update \
  && apt-get install -y apt-utils \
  && apt-get install -y ${EPHIMERAL_PACKAGES} ${PACKAGES} \
  && curl -sL https://deb.nodesource.com/setup_8.x | bash - \
  && apt-get install -y nodejs

# Install app dependencies
WORKDIR /tmp
COPY package.json /tmp/
RUN npm config set registry http://registry.npmjs.org/

# Install yarn for dev and faster builds
RUN npm i -g yarn
RUN yarn install

# Clean up apt packages not needed
RUN apt-get remove --purge -y ${EPHIMERAL_PACKAGES} \
  ; apt-get autoremove -y ${EPHIMERAL_PACKAGES} \
  ; apt-get clean \
  ; apt-get autoclean \
  ; echo -n > /var/lib/apt/extended_states \
  ; rm -rf /var/lib/apt/lists/* \
  ; rm -rf /usr/share/man/?? \
  ; rm -rf /usr/share/man/??_*

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app
RUN cp -a /tmp/node_modules /usr/src/app/

# Build distribution
RUN yarn run clean && yarn run build

# Set the default host/port
ENV HOST 0.0.0.0
ENV PORT 4000
EXPOSE 4000

# Start the server by default
CMD npm run server
