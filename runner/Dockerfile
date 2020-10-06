FROM node:12

EXPOSE 3009

WORKDIR /usr/src/app

COPY . .

RUN yarn
RUN yarn build:dependencies
RUN yarn build

CMD [ "yarn", "runner", "start" ]
