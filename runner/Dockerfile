FROM node:12

WORKDIR /usr/src/app

ENV NODE_ENV production
ENV SSL_KEY /usr/src/app/server.key
ENV SSL_CERT /usr/src/app/server.crt

EXPOSE 3009

CMD [ "npm", "start" ]

RUN apt-get update && \
    apt-get install -y openssl && \
    openssl req -x509 -newkey rsa:4096 -nodes -keyout server.key -out server.crt -days 365 -subj "/CN=localhost"

WORKDIR /usr/src/app/engine

COPY engine/package*.json ./
RUN npm install --production
COPY engine/. .

WORKDIR /usr/src/app/runner

COPY runner/package*.json ./
RUN npm install --production

COPY runner/. .
