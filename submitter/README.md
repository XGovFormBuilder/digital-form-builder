# digital-form-builder-submitter

This is an optional additional module for the digital-form-builder project.

The submitter acts as one half of the form builder queue system, used for saving your form submissions to a database prior to running webhook inputs.

## Setup

The Submitter needs a running database instance to connect to in order to work properly.

To connect a database instance, configure the following environment variables:

| Variable name           | Definition                                                        | Example                                   |
| ----------------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| QUEUE_DATABASE_URL      | Used for configuring the endpoint of the database instance        | mysql://username:password@dbhost/database |
| QUEUE_DATABASE_USERNAME | Used for configuring the user being used to access the database   | root                                      |
| QUEUE_DATABASE_PASSWORD | Used for configuring the password used for accessing the database | password                                  |

Once these variables are set, the submitter will run a series of migrations that will set up your chosen database.

## Other settings

The submitter will poll the database for new submissions at regular intervals. The submitter can also delete rows after a specified amount of time, in line with you organisation's retention policy.

These intervals can be set using the following environment variables:

| Variable name          | Definition                                                                                      | Default |
| ---------------------- | ----------------------------------------------------------------------------------------------- | ------- |
| QUEUE_POLLING_INTERVAL | The length of time, in milliseconds, between poll requests                                      | 5000    |
| QUEUE_RETENTION_PERIOD | The length of time, in days, that a successful submission will be kept for before being deleted | 365     |
| MAX_RETRIES            | The maximum number of times to retry a failed request                                           | 1000    |

If a submission should only be tried once, configure your webhook output with the option `"allowRetry": false`. [Check docs/runner/submission-queue.md](./../docs/runner/submission-queue.md) for a full example.

## Error codes

The submitter may fail to submit a form for a variety of reasons. In each, case one of the following error codes will be thrown:

| Code | Example                                                 | Definition                                                                                                                                                                        |
| ---- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q001 | Q001 - Prisma (ORM) could not find submission {details} | There was an issue with the ORM reading from the database. See PXX code, and their [supporting documentation](https://www.prisma.io/docs/reference/api-reference/error-reference) |
| Q002 | Post to webhook failed {details} {rowId: X}             | This can be an issue with the URL being sent to, the data being posted, or that the webhook responded with an error. See the details of the error for more information.           |
| Q003 | Updating DB failed                                      | This means there was an issue with either setting the record to `complete: true`, or an issue with incrementing `retry_counter`                                                   |

### Retention errors

In some circumstances, the submitter may fail to run the scheduled redaction task. In those cases the submitter will return one of the following error codes:

| Code | Example                                   | Definition                                                                                           |
| ---- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| R001 | Could not set retention period            | environment variable QUEUE_RETENTION_PERIOD_DAYS could not be parsed into int. This defaults to 365. |
| R002 | Could not delete records < \${date}       | The date printed is the date used to query the database.                                             |
| R003 | Could not run, caught exception {details} | There was an issue running the deletion cron.                                                        |
