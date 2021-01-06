FROM ghcr.io/xgovformbuilder/digital-form-builder-designer:latest

WORKDIR /usr/src/app

USER root
RUN deluser --remove-home appuser && \
 addgroup -g 1001 appuser && \
 adduser -S -u 1001 -G appuser appuser

USER 1001

EXPOSE 3000

CMD [ "yarn", "designer", "start" ]