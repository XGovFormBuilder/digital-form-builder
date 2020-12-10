FROM node:12-alpine3.12 AS build
WORKDIR /usr/src/app
COPY . .
RUN apk add --no-cache bash
RUN yarn workspaces focus @xgovformbuilder/designer --production

FROM node:12-alpine3.12 AS run
RUN adduser -D -u 1001 app
RUN mkdir -p /user/src/app && chown -R app /user/src/app
WORKDIR /usr/src/app
USER 1001
COPY --from=build /usr/src/app/designer ./designer
COPY --from=build /usr/src/app/model ./model
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./
EXPOSE 3000
CMD [ "yarn", "designer", "start" ]
