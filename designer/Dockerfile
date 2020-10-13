FROM node:12-alpine3.12 AS build
WORKDIR /usr/src/app
COPY . .
RUN apk add --no-cache bash
RUN yarn
RUN yarn model build
RUN yarn build

FROM node:12-alpine3.12 AS run
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/designer ./designer
COPY --from=build /usr/src/app/model ./model
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./
EXPOSE 3000
CMD [ "yarn", "designer", "production" ]
