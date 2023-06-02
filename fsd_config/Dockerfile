ARG BASE_IMAGE_TAG="latest"
FROM ghcr.io/communitiesuk/digital-form-builder-dluhc-runner:$BASE_IMAGE_TAG as base
ARG FORMS_DIR="forms-v3"
WORKDIR /usr/src/app
RUN rm -r runner/dist/server/forms && rm -r runner/src && rm -r runner/test
COPY ./fsd_config/form_jsons/cof_r2/en/* runner/dist/server/forms/
COPY ./fsd_config/form_jsons/cof_r2/cy/* runner/dist/server/forms/
COPY ./fsd_config/form_jsons/cof_r3/en/* runner/dist/server/forms/
COPY ./fsd_config/form_jsons/cof_r3/cy/* runner/dist/server/forms/
COPY ./fsd_config/form_jsons/night_shelter/* runner/dist/server/forms/
COPY ./fsd_config/config/* runner/config/
CMD [ "yarn", "runner", "build"]

FROM base as app
WORKDIR /usr/src/app
USER root
RUN deluser --remove-home appuser && \
 addgroup -g 1001 appuser && \
 adduser -S -u 1001 -G appuser appuser
USER appuser

EXPOSE 3009

ENV NODE_ENV=production
USER 1001
CMD [ "yarn", "runner", "start"]
