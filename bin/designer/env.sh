#!/usr/bin/env bash

export KUBE_CERTIFICATE_AUTHORITY=https://raw.githubusercontent.com/UKHomeOffice/acp-ca/master/${DRONE_DEPLOY_TO=notset}.crt

export IMAGE_VERSION=${DRONE_TAG=${DRONE_COMMIT_SHA=notset}}

case ${DRONE_DEPLOY_TO} in

'acp-prod')
    export KUBE_SERVER="https://kube-api-prod.prod.acp.homeoffice.gov.uk"
    export KUBE_TOKEN=${KUBE_TOKEN_ACP_PROD=notset}
    export INTERNAL_URL=".internal.stp-prod.homeoffice.gov.uk"
    export EXTERNAL_URL=".stp-prod.homeoffice.gov.uk"
    export SERVICE_REPLICAS=1
    export UPTIME='Mon-Sun 00:00-00:00 Europe/London'
   ;;

'acp-notprod')

    export KUBE_SERVER="https://kube-api-notprod.notprod.acp.homeoffice.gov.uk"
    export KUBE_TOKEN=${KUBE_TOKEN_ACP_NOTPROD=notset}
    export UPTIME='Mon-Fri 08:00-22:00 Europe/London'

    case ${KUBE_NAMESPACE=notset} in

    'stp-dev')
        export INTERNAL_URL=".dev.internal.stp-notprod.homeoffice.gov.uk"
        export EXTERNAL_URL=".dev.stp-notprod.homeoffice.gov.uk"
        export SERVICE_REPLICAS=1
        ;;

    'stp-test')
        export INTERNAL_URL=".test.internal.stp-notprod.homeoffice.gov.uk"
        export EXTERNAL_URL=".test.stp-notprod.homeoffice.gov.uk"
        export SERVICE_REPLICAS=1
        ;;

    'stp-preprod')
        export INTERNAL_URL=".preprod.internal.stp-notprod.homeoffice.gov.uk"
        export EXTERNAL_URL=".preprod.stp-notprod.homeoffice.gov.uk"
        export SERVICE_REPLICAS=1
        ;;
    *)
        failed "Namespace '${KUBE_NAMESPACE}' is invalid, make sure 'KUBE_NAMESPACE' is set correctly."
    ;;
    esac
    ;;
*)
    failed "Environment '${DRONE_DEPLOY_TO}' is invalid, make sure 'DRONE_DEPLOY_TO' is set correctly."
;;
esac
