# This Dockerfile is for development only (to be used by docker-compose), for deployment use [designer|runner]/Dockerfile
FROM node:12-alpine3.12

# docker-compose args
ARG WORKSPACE_NAME
ARG SERVICE_PORT

RUN apk update
RUN apk upgrade
RUN apk add bash
RUN apk add inotify-tools

RUN mkdir -p /user/src/app
WORKDIR /usr/src/app

COPY . .

RUN yarn install
RUN yarn build:dependencies
RUN yarn $WORKSPACE_NAME build

EXPOSE $SERVICE_PORT
