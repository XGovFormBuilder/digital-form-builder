# Submission queue

The runner can be configured to add new submissions to a queue and, if using the MYSQL queue type, for this queue to be
processed by the submitter module.

`PGBOSS` is now the only allowed queue type to reduce maintenance burden. See the migration guide below for switching to PGBOSS.

For `PGBOSS`, which handles events and queues as expected from event based architecture. The `PGBOSS` queue type
uses [pg-boss](https://www.npmjs.com/package/pg-boss).
You must have a postgres >v11 database configured. The runner will add job to the queue. It will then
poll `pgBoss.getJobById` for the reference number you wish to return to the user. You must implement this yourself.

In future, we may add support for different types of queues, like SQS.

## Setup

### Prerequisites

Decide if event or message based architecture is the right approach for your service, and if you have the digital
capability to support it in your organisation.
You may need queuing if your service expects high volume of submissions, but your webhook endpoints or further
downstream endpoints change frequently or have slow response times.

You will need to set up a PostgreSQL database.

Use `PGBOSS` and PostgreSQL for higher availability and features like exponential backoff.
It is highly recommended you use `PGBOSS` and PostgreSQL. 

#### PGBOSS Prerequisites

- PostgreSQL database >=v11
- A worker process which can connect to the PostgreSQL database, via PgBoss. 
  - You may use our [forms-worker](https://github.com/XGovFormBuilder/forms-worker), or implement your own.


When using pgboss, it is important that successful work returns `{ reference }` so that the runner can retrieve the successful response. Thrown errors will be recorded in the database for you to investigate later. Logging has been omitted for brevity, but you should include it!

- The `jobId` is generated when a users' submission is successfully inserted into the queue
- The webhook endpoint should respond with application/json `{ "reference": "FCDO-3252" }`


Webhooks can be configured so that the submitter only attempts to post to the webhook URL once.

```.json
{
  "outputs": [
    {
      "type": "webhook",
      "name": "api",
      "outputConfiguration": {
        "url":"“https://api:9000",
        "allowRetry": false
      }
    }
  ]
}
```

## Running locally

To use the submission queue locally, you will need to have a running instance of a database, the runner, and the
submitter. The easiest way to do this is by using the provided `docker-compose.yml` file.

In that file, you will see the following lines commented out under the runner service:


```yaml
  runner:
    container_name: runner
    image: digital-form-builder-runner
    environment:
# ...
#      - ENABLE_QUEUE_SERVICE=true
#      - QUEUE_DATABASE_URL=postgres://user:root@postgres:5432/queue
#      - QUEUE_TYPE="PGBOSS"
```

and two services commented out, `postgres` and `worker`.

```yaml
## use psql if you want a PostgreSQL based queue
#postgres:
#  container_name: postgres
#  image: "postgres:16"
#  ports:
#    - "5432:5432"
#  environment:
#    POSTGRES_DB: queue
#    POSTGRES_PASSWORD: root
#    POSTGRES_USER: user
#
## uncomment worker if using PGBOSS queue
#worker:
#  depends_on: [postgres]
#  platform: linux/amd64
#  container_name: worker
#  image: ghcr.io/xgovformbuilder/forms-worker:latest
#  environment:
#    QUEUE_URL: "postgres://user:root@postgres:5432/queue"

```

Uncommenting the environment variables under the runner configuration will enable the queue service and set the database
url to the url of your postgres container.

Uncommenting the postgres dependency will make sure the postgres server is started before worker connects to it.

Uncommenting the worker configuration start up the [forms-worker](https://github.com/XGovFormBuilder/forms-worker). The 
worker will poll the database every 2 seconds by default, but you may increase that by adding a new environment variable `NEW_JOB_CHECK_INTERVAL`, which is in ms.
Other environment variables can be found in the [forms-worker README](https://github.com/XGovFormBuilder/forms-worker?tab=readme-ov-file#environment-variables).

Once your docker-compose file is ready, start all of your containers by using the command `docker compose up`
or `docker compose up -d` to run the containers in detached mode.

## Error codes

If sending the form submission to the queue, or polling the database for the form reference, is not successful the
following errors will be thrown:

| Tags                                        | Example                                                           |
| ------------------------------------------- | ----------------------------------------------------------------- |
| QueueStatusService, outputRequests          | There was an issue sending the submission to the submission queue |
| QueueService, pollForRef, Row ref: [row_id] | Submission row not found                                          |

## Migration guide

If you are moving from MYSQL to PGBOSS, ensure you have a worker which will handle the jobs added to your queue. For "zero downtime",

1. Set up any new infrastructure components if necessary (e.g. database and worker)
1. Point the runner to the new components via `QUEUE_DATABASE_URL`
1. Keep the MySQL database as well as the submitter running. Do not delete these yet
1. Deploy new infrastructure components alongside the existing components

Any submissions that have previously failed, or were submitted during deployment, can continue to run and submit to your webhook endpoints.
Check the database to ensure that there are no more failed entries.

You may then safely remove the submitter, and MySQL database (if it is not used for any other purpose).
