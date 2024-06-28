# Submitter and DB queue - Upgrade to PostgreSQL and pg-boss

- Status: [ accepted ]
- Deciders: FCDO / OS maintainers: [@jenbutongit](https://github.com/jenbutongit) [@superafroman](https://github.com/superafroman)
- Date: 2024-01-12, updated 2024-01-17

## Context and Problem Statement

This is an addition to [0003-submitter.md](./0003-submitter.md). ADRs 0003-submitter and 0004-submitter aim to make your services more reliable and resilient.

As stated in [0003-submitter.md](./0003-submitter.md), an upgrade to option 2 would be possible.
~~Instead of polling a database for the reference number, it will make a GET request instead. This allows for better microservices architecture.~~
To simplify architecture, for now, we will use the pg-boss utility method `getJobById`. Other queues do not typically implement this.

## Decision Drivers <!-- optional -->

### Better architectural decoupling (microservices)

When queues are enabled the database, runner, submitter, and webhook endpoints are tightly coupled. Each of the services (runner, submitter and webhook)
are communicating via a single entry. If the schema is required to change, it creates a breaking change across all 3 services, and the deployments need to be coordinated.

By only allowing the runner to submit to a queue, and poll reference numbers via an API, we remove the coupling from the runner. It no longer needs to keep track of the databases' schema.

### Performance

#### PostgreSQL and pg-boss

pg-boss relies on PostgreSQL to queue jobs and easily allow processing of jobs. It also leverages node's event features (e.g. events and event emitter) to improve performance.
PostgreSQL has features with messaging built in mind, for example SKIP LOCKED to ensure rows are not being read or written by different processes. The MySQL based submitter does not currently do this.

### Support/Maintenance

Pg-boss is a lot more feature rich than our mysql based submitter. It has support for exponential backoff, pub/sub, automatic creation of tables and more.
It's far too much for us to write our own equivalent! There are some equivalent libraries available for MySQL, but are not as feature rich, or as well maintained.

The pg-boss implementation will also allow easier support for other queues, like SQS, Kafka, RabbitMQ. All with their own libraries or SDKs that allow events to be emitted and consumed easily.

### Negative Consequences

- The MySQL queue is likely to be deprecated due to support/maintenance overheads.
- For the time being, both queue types will be supported, which means that there is more code to maintain and some additional complexity
