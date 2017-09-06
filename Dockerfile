FROM debian:jessie-slim

ENV EPHIMERAL_PACKAGES "build-essential dh-autoreconf curl xz-utils python"
ENV PACKAGES "libpng-dev"

# Add `package.json` to build Debian compatible NPM packages
WORKDIR /src
ADD package.json .

# install everything (and clean up afterwards)
RUN apt-get update \
  && apt-get install -y apt-utils \
  && apt-get install -y ${EPHIMERAL_PACKAGES} ${PACKAGES} \
  && curl -sL https://deb.nodesource.com/setup_8.x | bash - \
  && apt-get install -y nodejs \
  && cd /src \
  && npm i \
  ; apt-get remove --purge -y ${EPHIMERAL_PACKAGES} \
  ; apt-get autoremove -y ${EPHIMERAL_PACKAGES} \
  ; apt-get clean \
  ; apt-get autoclean \
  ; echo -n > /var/lib/apt/extended_states \
  ; rm -rf /var/lib/apt/lists/* \
  ; rm -rf /usr/share/man/?? \
  ; rm -rf /usr/share/man/??_*

# Add the remaining project files
ADD . .

# Build distribution
RUN npm run build

# Set the default host/port
ENV HOST 0.0.0.0
ENV PORT 4000

# Start the server by default
CMD npm run server
