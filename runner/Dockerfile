# ----------------------------
# Stage 1
# Base image contains the updated OS and
# It also configures the non-root user that will be given permission to copied files/folders in every subsequent stages
FROM node:12-alpine3.12 AS base

RUN mkdir -p /usr/src/app && \
    addgroup -g 1001 appuser && \
    adduser -S -u 1001 -G appuser appuser && \
    chown -R appuser:appuser /usr/src/app && \
    chmod -R +x  /usr/src/app && \
    apk update && \
    apk upgrade && \
    apk add --no-cache bash && \
    apk add --no-cache rsync

# ----------------------------
# Stage 2
# Cache layer contains npm packages for all workspaces
# It will re-run only if one of the copied files change, otherwise this stage is cached
FROM base AS dependencies
WORKDIR /usr/src/app
COPY --chown=appuser:appuser .yarn ./.yarn/
COPY --chown=appuser:appuser package.json yarn.lock .yarnrc.yml tsconfig.json  ./
COPY --chown=appuser:appuser model/package.json ./model/
COPY --chown=appuser:appuser designer/package.json ./designer/
COPY --chown=appuser:appuser runner/package.json ./runner/
RUN yarn

# ----------------------------
# Stage 3
# Base with model stage
# In this layer we build the model workspace.
# It will re-run only if anything inside ./model changes, otherwise this stage is cached.
# rsync is used to merge folders instead of individually copying files
FROM dependencies AS model
WORKDIR /usr/src/app
COPY ./model ./model/
RUN yarn model build


# ----------------------------
# Stage 4
# Build stage
# In this layer we build the runner workspace
# It will re-run only if anything inside ./runner changes, otherwise this stage is cached.
# rsync is used to merge folders instead of individually copying files
FROM model AS build-runner
WORKDIR /usr/src/app
COPY ./runner ./runner/
RUN yarn runner build && \
    rm -rf ./designer
USER 1001
EXPOSE 3009
CMD [ "yarn", "runner", "start" ]
