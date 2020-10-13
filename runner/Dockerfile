FROM node:12-alpine3.12 AS build
WORKDIR /usr/src/app
COPY . .
RUN apk add --no-cache bash
RUN yarn
RUN yarn build:dependencies
RUN yarn build

FROM node:12-alpine3.12 AS run
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/engine ./engine
COPY --from=build /usr/src/app/model ./model
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/runner ./runner
COPY --from=build /usr/src/app/package.json ./
EXPOSE 3009
CMD [ "yarn", "runner", "production" ]
