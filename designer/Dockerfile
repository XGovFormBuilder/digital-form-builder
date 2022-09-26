# ----------------------------
# Stage 1
# Base image contains the updated OS and
# It also configures the non-root user that will be given permission to copied files/folders in every subsequent stages
FROM node:16-alpine AS base
RUN mkdir -p /usr/src/app && \
    addgroup -g 1001 appuser && \
    adduser -S -u 1001 -G appuser appuser && \
    chown -R appuser:appuser /usr/src/app && \
    chmod -R +x  /usr/src/app && \
    apk update && \
    apk add --no-cache bash git

# ----------------------------
# Stage 2
# Cache layer contains npm packages for all workspacesrunne
# It will re-run only if one of the copied files change, otherwise this stage is cached
FROM base AS dependencies
WORKDIR /usr/src/app
COPY --chown=appuser:appuser .yarn ./.yarn/
COPY --chown=appuser:appuser package.json yarn.lock .yarnrc.yml tsconfig.json  ./
USER 1001
RUN --mount=type=cache,target=.yarn/cache,id=base,uid=1001,mode=0755 yarn


# ----------------------------
# Stage 3
# Base with model stage
# In this layer we build the model workspace.
# It will re-run only if anything inside ./model changes, otherwise this stage is cached.
# rsync is used to merge folders instead of individually copying files
FROM dependencies AS model
WORKDIR /usr/src/app
COPY --chown=appuser:appuser ./model/package.json ./model/tsconfig.json ./model/babel.config.json ./model/
COPY --chown=appuser:appuser ./model/src ./model/src/
RUN --mount=type=cache,target=.yarn/cache,uid=1001,mode=0755,id=model \
    --mount=type=cache,target=.yarn/cache,uid=1001,mode=0755,id=base yarn workspaces focus @xgovformbuilder/model
RUN yarn model build
# ----------------------------
# Stage 4
# Build stage
# In this layer we build the runner workspace
# It will re-run only if anything inside ./runner changes, otherwise this stage is cached.
# rsync is used to merge folders instead of individually copying files
FROM model AS build-designer
WORKDIR /usr/src/app
ARG LAST_COMMIT="NOT_DEFINED"
ARG LAST_TAG="NOT_DEFINED"
ENV LAST_COMMIT=$LAST_COMMIT
ENV LAST_TAG=$LAST_TAG
COPY --chown=appuser:appuser designer/package.json ./designer/
RUN --mount=type=cache,target=.yarn/cache,id=designer,uid=1001,mode=0755 yarn workspaces focus @xgovformbuilder/designer
COPY --chown=appuser:appuser ./designer ./designer/

RUN touch ./designer/.env && \
    echo "LAST_TAG_GH=$LAST_TAG" >> ./designer/.env  && \
    echo "LAST_COMMIT=$LAST_COMMIT" >> ./designer/.env
RUN yarn designer build

USER 1001
EXPOSE 3000
CMD [ "yarn", "designer", "start" ]
