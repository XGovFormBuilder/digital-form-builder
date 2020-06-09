FROM node:12

WORKDIR /usr/src/app

EXPOSE 3000

CMD [ "npm", "start" ]

WORKDIR /usr/src/app/engine

COPY engine/package*.json ./
RUN npm install
COPY engine/. .

WORKDIR /usr/src/app/designer

COPY designer/package*.json ./
RUN npm install

COPY designer/. .
