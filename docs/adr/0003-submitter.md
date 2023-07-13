# Submitter and DB queue

- Status: [ accepted ]
- Deciders: FCDO / OS maintainers: [@jenbutongit](https://github.com/jenbutongit) [@superafroman](https://github.com/superafroman)
- Date: [2023-07-13 when the decision was last updated]

## Context and Problem Statement

After a user submits their form, if there is an issue with submission, whether on the runner side, or webhook, this submission is essentially "lost".

We do provide logging of the full payload if there is an error, however would require support staff to manually re-enter details.

## Decision Drivers <!-- optional -->

- We have "lost" submissions due to webhook errors
- It is likely all transactional services will require to implement a queue or some failsafe to ensure submissions aren't lost
  - We are building a new service built in node, so have decided to implement this directly into the form builder

## Considered Options

### Option 1

1. After a user submits a form, push the payload into the database, including any additional information required
2. A separate microservice "Submitter" will poll the database for unsent or failed entries
3. Submitter posts to the webhook, and the webhook will respond to the submitter
4. On response, update the entry and flag it as "successful" with reference code if applicable
5. The runner will continuously poll the database for 2 seconds to check if there is an update or reference number
6. As long as the database insertion described in (1) is successful, the user will see the success page

### Option 2

1. After a user submits a form, push the payload into the database, including any additional information required
2. A separate microservice "Submitter" will poll the database for unsent or failed entries
3. Submitter posts to the webhook, and the webhook will respond to the submitter
4. On response, update the entry and flag it as "successful" with reference code if applicable
5. The runner will continuously poll an endpoint on the submitter, like `/status` rather than the database directly

- This allows us to manage database connections or lockups, and allow us to apply rate limiting however will take more time to implement

### Option 3

Use a native queue service, like SQS.

## Decision Outcome

Option 1 for now, however an upgrade to Option 2 will be possible.

Most transactional services will already have a database, or be able to provision one simply.
Databases are easily set up via Docker, enabling faster local development. We will also circumvent any vendor lock-in this way (AWS vs Azure vs GCP).
