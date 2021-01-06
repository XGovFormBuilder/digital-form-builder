#!/usr/bin/env bash

set -o errexit
set -o nounset

export NAME="form-designer"
export PORT=3000

echo "--- environment   : ${DRONE_DEPLOY_TO=notset}"
echo "--- namespace     : ${KUBE_NAMESPACE=notset}"
echo "--- deploying     : ${NAME}"
echo "--- branch        : ${DRONE_BRANCH=notset}"
echo "--- tag           : ${DRONE_TAG=notset}"
echo "--- image version : ${IMAGE_VERSION=notset}"

if ! kd --timeout=5m \
  -f kube/designer/deployment.yaml \
  -f kube/designer/service.yaml \
  -f kube/designer/networkpolicy-internal.yaml \
  -f kube/designer/networkpolicy-external.yaml \
  -f kube/designer/ingress-internal.yaml \
  -f kube/designer/ingress-external.yaml \
  ; then
  echo "[error] failed to deploy ${NAME}"
  exit 1
fi
