# Submission queue

The runner can be configured to add new submissions to a queue, and for this queue to be processed by the submitter module.

By enabling the queue service this will change the webhook process, so that the runner will push the submission to a specified database, and will await a response from the submitter for a few seconds before returning the success screen to the user.

## Setup

Before enabling the queue service you will need a database instance set up which the runner can access. Once your database is set up, you can enable the queue service by configuring the following environment variables:

| Variable name                  | Definition                                                                               | Default | Example                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------- | ------- | ------------------------------------------- |
| ENABLE_QUEUE_SERVICE           | Whether the queue service is enabled or not                                              | `false` |                                             |
| QUEUE_DATABASE_URL             | Used for configuring the endpoint of the database instance                               |         | mysql://username:password@endpoint/database |
| QUEUE_DATABASE_USERNAME        | Used for configuring the user being used to access the database                          |         | root                                        |
| QUEUE_DATABASE_PASSWORD        | Used for configuring the password used for accessing the database                        |         | password                                    |
| QUEUE_SERVICE_POLLING_INTERVAL | The amount of time, in milliseconds, between poll requests for updates from the database | 500     |                                             |

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

To use the submission queue locally, you will need to have a running instance of a database, the runner, and the submitter. The easiest way to do this is by using the provided `docker-compose.yml` file.

In that file, you will see the following lines commented out:

```yaml
43    #      - ENABLE_QUEUE_SERVICE=true
44    #      - QUEUE_DATABASE_URL=mysql://root:root@mysql:3306/queue
45    #      - DEBUG="prisma*"
 ---------------------------------------------------------------------
50    #      mysql:
51    #        condition: service_healthy
 ---------------------------------------------------------------------
57    #  submitter:
58    #    image: digital-form-builder-submitter
59    #    build:
60    #      context: .
61    #      dockerfile: ./submitter/Dockerfile
62    #    ports:
63    #      - "9000:9000"
64    #    environment:
65    #      - PORT=9000
66    #      - QUEUE_DATABASE_URL=mysql://root:root@mysql:3306/queue
67    #      - QUEUE_POLLING_INTERVAL=5000
68    #      - DEBUG="prisma*"
69    #    command: yarn submitter start
70    #    depends_on:
71    #      mysql:
72    #        condition: service_healthy
```

Uncommenting the environment variables under the runner configuration will enable the queue service, set the database url to the url of your mysql container, and turn on debug messages for prisma (the ORM used to communicate with the database).
Uncommenting the mysql dependency will make sure the mysql server is started before prisma starts trying to connect to it.
Uncommenting the submitter configuration will trigger the submitter to be created, exposed on port 9000, connecting to the mysql container, with a polling interval of 5 seconds.

Once your docker-compose file is ready, start all of your containers by using the command `docker compose up` or `docker compose up -d` to run the containers in detached mode.

## Error codes

If sending the form submission to the queue, or polling the database for the form reference, is not successful the following errors will be thrown:

| Tags                                        | Example                                                           |
| ------------------------------------------- | ----------------------------------------------------------------- |
| QueueStatusService, outputRequests          | There was an issue sending the submission to the submission queue |
| QueueService, pollForRef, Row ref: [row_id] | Submission row not found                                          |
