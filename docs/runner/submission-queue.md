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
  “outputs”: [
    {
      “type”: “webhook”,
      “name”: “api”,
      “outputConfiguration”: {
        “url”: “https://api:9000”,
        “allowRetry”: false
      }
    }
  ]
}
```
