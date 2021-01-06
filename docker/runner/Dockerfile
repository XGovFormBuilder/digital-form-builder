FROM ghcr.io/xgovformbuilder/digital-form-builder-runner:latest

WORKDIR /usr/src/app

COPY . .
USER root
RUN deluser --remove-home appuser && \
 addgroup -g 1001 appuser && \
 adduser -S -u 1001 -G appuser appuser
EXPOSE 3009
USER 1001
CMD [ "yarn", "runner", "start" ]