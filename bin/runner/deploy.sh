#!/usr/bin/env bash

set -o errexit
set -o nounset

export NAME="form-builder"
export DOCUMENT_UPLOAD_SERVICE_NAME="form-doc-upload"
export SUBMISSION_SERVICE_NAME="form-submission"
export PORT=3009

echo "--- environment   : ${DRONE_DEPLOY_TO=notset}"
echo "--- namespace     : ${KUBE_NAMESPACE=notset}"
echo "--- deploying     : ${NAME}"
echo "--- branch        : ${DRONE_BRANCH=notset}"
echo "--- tag           : ${DRONE_TAG=notset}"
echo "--- image version : ${IMAGE_VERSION=notset}"

if ! kd --timeout=5m \
  -f kube/runner/deployment.yaml \
  -f kube/runner/service.yaml \
  -f kube/runner/networkpolicy-internal.yaml \
  -f kube/runner/networkpolicy-external.yaml \
  -f kube/runner/ingress-internal.yaml \
  -f kube/runner/ingress-external.yaml \
  ; then
  echo "[error] failed to deploy ${NAME}"
  exit 1
fi
