# Mid journey save and returns

- Status: [proposed] <!-- optional -->
- Deciders: OS maintainers [@jenbutongit](https://github.com/jenbutongit) [@superafroman](https://github.com/superafroman) [@ziggy-cyb](https://github.com/ziggy-cyb)

- Date: [2024-06-13 when the decision was last updated] <!-- optional -->

## Context and Problem Statement

It is currently possible to inject a full or partial session _into_ the runner, but it is not possible to send session data
externally in the middle of a form. For long forms, or forms which require the user to get a document or find out more
information, they are unable to exit the form without losing all their data.

## Considered Options

- Option 1
  - Add a flag, or flags (perhaps on certain pages only?), to the form configuration, e.g. `allowSaveAndExit`, which will render a `Save and exit` button at the bottom of each question page
  - The data is then POSTed to a 3rd party application, which will then store the data in their chosen database
    - Optionally, add a data format to webhook outputs, which matches the state as stored in redis
    - Optionally, add a data format to the `/sessions/{formId}` endpoint, which matches the state, as stored in redis
  - The 3rd party application must also handle rehydrating the user's session, and managing how they re-enter the application
  - after successful exit, show the user a success screen (customised similarly to the current application complete page), or allow the user to be redirected externally.
- Option 2
  - Add a flag, or flags (perhaps on certain pages only?), to the form configuration, e.g. `allowSaveAndExit`, which will render a `Save and exit` button at the bottom of each question page
  - The runner stores this in redis with a longer ttl, or another database (possibly postgres), and sends the user a link so that they can return to their session
  - after successful exit, show the user a success screen (customised similarly to the current application complete page), or allow the user to be redirected externally.

## Decision Outcome

## Decision Outcome

Chosen option: "[option 1]", only teams with developers have asked for this feature. This will help us reduce the maintenance burden.
It also allows for flexibility on how users return to their journey (e.g. you may have a "task list" page on your application, which is authenticated).

## Pros and Cons of the Options

### [option 1]

- Good, because it encourages engineers to develop in a microservice architecture. In future, if the runner needs to be replaced,
  you will not need to rewrite the session hydration part of the application.
- Good, because teams looking to implement this feature may already have a preferred data store, and possibly an API which can serve this data.
  XGovFormBuilder will not lock teams into tech they are not familiar with, or add superfluous tech to their stack
- Good, because the only "required" additional technology XGovFormBuilder requires is currently Redis.
  However, Redis is not designed for long term storage.
- Good, because it does not lock teams/users into a specific user journey. In this instance, we would only allow users to return via a URL emailed to them.
- Bad, because it raises the bar to entry, a development team will be required.

We have also suggested that we add additional data formats to /sessions/{formId} and the webhook output. This is to improve
developer experience and simplify making session rehydration calls. The webhook output format which is required by /sessions/{formId}
is fairly verbose. It includes information like the page title, section, key and answer. This is so that there is reduced
data loss, in the event that forms are changed. Unrecognised keys can still be placed in a generic description field, along with the page title.

Some teams may only care about the key/answer, and accept the risk or have mitigated it in other ways when components names have changed.
This means that there would be an extra step for them to translate to/from this data format.

The data format changes can be worked on separately to the save and return feature, but this is a good time to add additional support.

Below is a comparison of the webhook format, and the state format.

In redis, the data will be stored like so

```json5
{
  progress: [],
  checkBeforeYouStart: {
    ukPassport: true,
  },
  applicantDetails: {
    numberOfApplicants: 2,
    phoneNumber: "123",
    emailAddress: "a@b",
    languagesProvided: ["fr", "it"],
    contactDate: "2024-12-25T00:00:00.000Z",
  },
  applicantOneDetails: {
    firstName: "Winston",
    lastName: "Smith",
    address: {
      addressLine1: "1 Street",
      town: "London",
      postcode: "ec2a4ps",
    },
  },
  applicantTwoDetails: {
    firstName: "Big",
    lastName: "Brother",
    address: {
      addressLine1: "King Charles Street",
      town: "London",
      postcode: "SW1A 2AH",
    },
  },
}
```

When making calls to /sessions/{formId}, the payload can be shortened slightly from the webhook output, since `question`, `title`, and `type` are not required.

```json5
{
  name: "Digital Form Builder - Runner undefined",
  metadata: {},
  questions: [
    {
      category: "checkBeforeYouStart",
      fields: [
        {
          key: "ukPassport",
          answer: true,
        },
      ],
      index: 0,
    },
    {
      category: "applicantDetails",
      fields: [
        {
          key: "numberOfApplicants",
          answer: 2,
        },
      ],
      index: 0,
    },
    {
      category: "applicantOneDetails",
      fields: [
        {
          key: "firstName",
          answer: "Winston",
        },
        {
          key: "lastName",
          answer: "Smith",
        },
      ],
      index: 0,
    },
    {
      category: "applicantOneDetails",
      fields: [
        {
          key: "address",
          answer: "1 Street, London, ec2a4ps",
        },
      ],
      index: 0,
    },
    {
      category: "applicantTwoDetails",
      question: "Applicant 2",
      fields: [
        {
          key: "firstName",
          title: "First name",
          type: "text",
          answer: "big",
        },
        {
          key: "lastName",
          title: "Surname",
          type: "text",
          answer: "brother",
        },
      ],
      index: 0,
    },
    {
      category: "applicantTwoDetails",
      question: "Address",
      fields: [
        {
          key: "address",
          title: "Address",
          type: "text",
          answer: "King Charles Street, London, SW1A 2AH",
        },
      ],
      index: 0,
    },
    {
      category: "applicantDetails",
      fields: [
        {
          answer: ["fr", "it"],
          key: "languagesProvided",
        },
      ],
      index: 0,
      question: "Which languages do you speak?",
    },
    {
      category: "applicantDetails",
      fields: [
        {
          key: "phoneNumber",
          answer: "123",
        },
        {
          key: "emailAddress",
          answer: "a@b",
        },
        {
          answer: "2024-12-25",
          type: "date",
        },
      ],
      index: 0,
    },
  ],
}
```

### [option 2]

- Good, because it simplifies enabling this feature. External applications/microservices do not need to be written.
- Bad, because it may require teams to run additional databases. XGovFormBuilder maintainers will need to write multiple adapters for different types of databases.
