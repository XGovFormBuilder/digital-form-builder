FROM node:12-alpine3.12 AS build
WORKDIR /usr/src/app
COPY . .
RUN apk add --no-cache bash
RUN yarn
RUN yarn model build
RUN yarn runner build

FROM node:12-alpine3.12 AS run
RUN adduser -D -u 1001 app
RUN mkdir -p /user/src/app && chown -R app /user/src/app
WORKDIR /usr/src/app
USER 1001
COPY --from=build /usr/src/app/runner ./runner
COPY --from=build /usr/src/app/model ./model
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./
EXPOSE 3009
CMD [ "yarn", "runner", "start" ]