# ----------------------------
# Stage 1
# Base image contains the updated OS and
# It also configures the non-root user that will be given permission to copied files/folders in every subsequent stages
FROM node:18-alpine AS base
RUN npm install -g npm@^9.x.x && \
    apk update && \
    apk upgrade && \
    apk add --no-cache bash git

# ----------------------------
# Stage 2
# Cache layer contains npm packages for all workspaces
# It will re-run only if one of the copied files change, otherwise this stage is cached
FROM base AS dependencies
WORKDIR /usr/src/app
COPY .yarn ./.yarn/
COPY package.json yarn.lock .yarnrc.yml tsconfig.json  ./
RUN yarn


# ----------------------------
# Stage 3
# Base with model stage
# In this layer we build the model workspace.
# It will re-run only if anything inside ./model changes, otherwise this stage is cached.
# rsync is used to merge folders instead of individually copying files
FROM dependencies AS model
WORKDIR /usr/src/app
COPY  ./model/package.json ./model/tsconfig.json ./model/babel.config.json ./model/
COPY ./model/src ./model/src/
RUN yarn workspaces focus @xgovformbuilder/model
RUN yarn model build


# ----------------------------
# Stage 4
# Build stage
# In this layer we build the runner workspace
# It will re-run only if anything inside ./runner changes, otherwise this stage is cached.
# rsync is used to merge folders instead of individually copying files
FROM dependencies AS build-runner
WORKDIR /usr/src/app
ARG LAST_COMMIT=""
ARG LAST_TAG=""
ENV LAST_COMMIT=$LAST_COMMIT
ENV LAST_TAG=$LAST_TAG
COPY --from=model /usr/src/app/model/dist/module ./model/dist/module/
COPY --from=model /usr/src/app/model/package.json ./model
COPY  ./runner/package.json ./runner/tsconfig.json ./runner/.babelrc ./runner/nodemon.json ./runner/
COPY  ./runner/config ./runner/config
RUN yarn workspaces focus @xgovformbuilder/runner
COPY  ./runner/src ./runner/src/
COPY  ./runner/bin ./runner/bin/
COPY  ./runner/public ./runner/public/
RUN touch runner/.env && \
    echo "LAST_TAG_GH=$LAST_TAG" >> runner/.env && \
    echo "LAST_COMMIT=$LAST_COMMIT" >> runner/.env

RUN yarn runner build


# ----------------------------
# Stage 5
# dist stage
# This layer copies built and required files only
FROM base as final
WORKDIR /usr/src/app
COPY --from=model /usr/src/app/model/dist/module ./model/dist/module/
COPY --from=model /usr/src/app/model/package.json ./model

COPY --from=build-runner /usr/src/app/runner/dist /usr/src/app/runner/dist/
COPY --from=build-runner /usr/src/app/node_modules ./runner/node_modules/
COPY --from=build-runner /usr/src/app/runner/config ./runner/config
COPY --from=build-runner /usr/src/app/runner/bin ./runner/bin/
COPY --from=build-runner /usr/src/app/runner/public ./runner/public/
COPY --from=build-runner /usr/src/app/yarn.lock ./
COPY --from=build-runner /usr/src/app/runner/package.json ./runner
COPY .yarn ./.yarn/
COPY package.json .yarnrc.yml ./
RUN yarn workspaces focus @xgovformbuilder/runner --production

USER node
EXPOSE 3009
CMD [ "yarn", "runner", "start" ]