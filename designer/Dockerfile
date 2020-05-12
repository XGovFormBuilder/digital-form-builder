FROM node:12

WORKDIR /usr/src/app

ENV NODE_ENV production

EXPOSE 3000

CMD [ "npm", "start" ]

WORKDIR /usr/src/app/engine

COPY engine/package*.json ./
RUN npm install --production
COPY engine/. .

WORKDIR /usr/src/app/designer

COPY designer/package*.json ./
RUN npm install --production

COPY designer/. .
