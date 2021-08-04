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
    apk add --no-cache bash git

# ----------------------------
# Stage 3
# Base with model stage
# In this layer we build the model workspace.
# It will re-run only if anything inside ./model changes, otherwise this stage is cached.
# rsync is used to merge folders instead of individually copying files
FROM base AS model
WORKDIR /usr/src/app
COPY --chown=appuser:appuser ./model ./model/
USER 1001
RUN yarn workspaces focus @xgovformbuilder/model && yarn model build
COPY --chown=appuser:appuser ./model/tsconfig.tsbuildinfo /tmp


# ----------------------------
# Stage 3
# Build stage
# In this layer we build the runner workspace
# It will re-run only if anything inside ./runner changes, otherwise this stage is cached.
# rsync is used to merge folders instead of individually copying files
FROM model AS build-designer
WORKDIR /usr/src/app
ARG LAST_COMMIT
ARG LAST_TAG
ENV LAST_COMMIT=$LAST_COMMIT
ENV LAST_TAG=$LAST_TAG
COPY --chown=appuser:appuser ./designer ./designer/
RUN yarn workspaces focus @xgovformbuilder/designer && yarn designer build
COPY --chown=appuser:appuser ./designer/tsconfig.tsbuildinfo /tmp
USER 1001
EXPOSE 3000
CMD [ "yarn", "designer", "start" ]
