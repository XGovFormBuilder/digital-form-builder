FROM node:12

WORKDIR /usr/src/app

ENV SSL_KEY /usr/src/app/server.key
ENV SSL_CERT /usr/src/app/server.crt

EXPOSE 3009

CMD [ "npm", "start" ]

RUN apt-get update && \
    apt-get install -y openssl && \
    openssl genrsa -des3 -passout pass:gsahdg -out server.pass.key 2048 && \
    openssl rsa -passin pass:gsahdg -in server.pass.key -out server.key && \
    rm server.pass.key && \
    openssl req -new -key server.key -out server.csr \
        -subj "/CN=localhost" && \
    openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

COPY package*.json ./

RUN npm install --production

COPY . .
