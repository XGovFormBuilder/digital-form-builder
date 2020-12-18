FROM node:12-alpine3.12 AS build
WORKDIR /usr/src/app
COPY . .
RUN apk add --no-cache bash
RUN npm install -g typescript
RUN npm install -g @babel/core @babel/cli
RUN yarn workspaces focus @xgovformbuilder/model
RUN yarn workspaces focus @xgovformbuilder/runner
RUN yarn model build
RUN yarn runner build

FROM node:12-alpine3.12 AS run
# working directory
WORKDIR /usr/src/app

# copy build from previous stage
COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/.yarn ./.yarn
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/runner ./runner
COPY --from=build /usr/src/app/model ./model

# create and set non-root USER
RUN addgroup -g 1001 appuser && \
    adduser -S -u 1001 -G appuser appuser
RUN chown -R appuser:appuser /usr/src/app && \
    chmod -R 777 /usr/src/app
USER 1001

EXPOSE 3009
CMD [ "yarn", "runner", "start" ]
