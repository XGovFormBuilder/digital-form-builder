# ----------------------------
# Stage 1
# Base image contains the updated OS and
# It also configures the non-root user that will be given permission to copied files/folders in every subsequent stages
FROM node:20-alpine AS base
RUN mkdir -p /usr/src/app && \
    addgroup -g 1001 appuser && \
    adduser -S -u 1001 -G appuser appuser && \
    chown -R appuser:appuser /usr/src/app && \
    chmod -R +x  /usr/src/app && \
    apk update && \
    apk add --no-cache bash git

# ----------------------------
# Stage 2
# Cache layer contains npm packages for all workspaces
# It will re-run only if one of the copied files change, otherwise this stage is cached
FROM base AS dependencies
WORKDIR /usr/src/app
COPY --chown=appuser:appuser .yarn ./.yarn/
COPY --chown=appuser:appuser package.json yarn.lock .yarnrc.yml tsconfig.json  ./
USER 1001
RUN --mount=type=cache,target=./.yarn/cache,id=base,uid=1001,mode=0755 yarn

# ----------------------------
# Stage 3
# Base with queue model stage
# In this layer we build the queue-model workspace.
# It will re-run only if anything inside /queue-model changes, otherwise this stage is cached.
# rsync is used to merge folders instead of individually copying files
FROM dependencies AS queue-model
WORKDIR /usr/src/app
COPY --chown=appuser:appuser ./queue-model/package.json ./queue-model/tsconfig.json ./queue-model/babel.config.json ./queue-model/schema.prisma ./queue-model/
COPY --chown=appuser:appuser ./queue-model/src ./queue-model/src/
COPY --chown=appuser:appuser ./queue-model/migrations ./queue-model/migrations/
RUN --mount=type=cache,target=.yarn/cache,uid=1001,mode=0755,id=queue-model \
    --mount=type=cache,target=.yarn/cache,uid=1001,mode=0755,id=queue-model yarn workspaces focus @xgovformbuilder/queue-model
RUN yarn queue-model build

# ----------------------------
# Stage 4
# Build stage
# In this layer we build the submitter workspace
# It will re-run only if anything inside ./submitter changes, otherwise this stage is cached.
# rsync is used to merge folders instead of individually copying files
FROM queue-model AS build-submitter
WORKDIR /usr/src/app
ARG LAST_COMMIT=""
ARG LAST_TAG=""
ENV LAST_COMMIT=$LAST_COMMIT
ENV LAST_TAG=$LAST_TAG
COPY --chown=appuser:appuser ./submitter/package.json ./submitter/tsconfig.json ./submitter/.babelrc ./submitter/nodemon.json ./submitter/
COPY --chown=appuser:appuser ./submitter/config ./submitter/config
RUN --mount=type=cache,target=.yarn/cache,uid=1001,mode=0755,id=runner \
    yarn workspaces focus @xgovformbuilder/submitter
COPY --chown=appuser:appuser ./submitter/src ./submitter/src/
RUN touch submitter/.env && \
    echo "LAST_TAG_GH=$LAST_TAG" >> submitter/.env && \
    echo "LAST_COMMIT=$LAST_COMMIT" >> submitter/.env

RUN yarn submitter build
USER 1001
EXPOSE 9000
CMD [ "yarn", "submitter", "start" ]
