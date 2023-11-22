# digital-form-builder-submitter

This is an optional additional module for the digital-form-builder project.

The submitter acts as one half of the form builder queue system, used for saving your form submissions to a database prior to running webhook inputs.

## Setup

The Submitter needs a running database instance to connect to in order to work properly.

To connect a database instance, configure the following environment variables:

| Variable name           | Definition                                                        | Example                                     |
| ----------------------- | ----------------------------------------------------------------- | ------------------------------------------- |
| QUEUE_DATABASE_URL      | Used for configuring the endpoint of the database instance        | mysql://username:password@endpoint/database |
| QUEUE_DATABASE_USERNAME | Used for configuring the user being used to access the database   | root                                        |
| QUEUE_DATABASE_PASSWORD | Used for configuring the password used for accessing the database | password                                    |

Once these variables are set, the submitter will run a series of migrations that will set up your chosen database.

## Other settings

The submitter will poll the database for new submissions at regular intervals. The submitter can also delete rows after a specified amount of time, in line with you organisation's retention policy.

These intervals can be set using the following environment variables:

| Variable name | Definition | Default |
| QUEUE_POLLING_INTERVAL | The length of time, in milliseconds, between poll requests | 5000 |
| QUEUE_RETENTION_PERIOD | The length of time, in days, that a submission will be kept for before being deleted | 365 |
