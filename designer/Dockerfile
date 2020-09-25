FROM node:12

EXPOSE 3000

WORKDIR /usr/src/app

COPY . .

RUN yarn
RUN yarn build:dependencies
RUN yarn build

CMD [ "yarn", "designer", "start" ]