# Exiting

This feature allows the user to exit a form. Their data will be sent to the configured URL. It is not the Runner's
responsibility to persist this data.

You can use this feature alongside [session-initialisation.md](./session-initialisation.md) to allow users to "save and return".

If the `exitOptions` property is present on the form, the form will be considered as "allowing exits". You must remove this
to disable it.

If exits are allowed, on all question pages, a button "save and come back later" will be displayed below the continue button.
When the user selects this

1. They will be taken to a page /{id}/exit/email, where /{id} is the form's ID (i.e. the form's file name), which asks for the user's email address.
2. If the email address is valid, a POST request will be made to the configured URL with the user's data
3. If the POST request was successful (2xx) code, the user will be redirected to a page /{id}/exit/status
   - If the persistence API returned with a `redirectUrl` in the response body, the user will be redirected to this URL
   - If no redirectUrl was returned, the user will be shown a page detailing the email address it was sent to.
     - If the persistence API returned with an `expiry` in the response body, the user will be shown a message detailing how long they have to return
4. The user's cache will then be cleared

## Configuration

The exit feature is configured in the form JSON on the `exitOptions` property.

```json5
{
  pages: [],
  lists: [],
  // ..etc
  exitOptions: {
    url: "your-persistence-api:3005",
    format: "WEBHOOK", // can be "WEBHOOK" or "STATE"
  },
}
```

`exitOptions.format` can be `WEBHOOK` or `STATE`. This will control in which format the data is sent exitOptions.url.

## Data sent

Depending on which `exitOptions.format` is configured for the form, the format the users' answers are in will be different.

With both formats, the request body will always include `exitState`.

```json5
{
  exitState: {
    exitEmailAddress: "abc@def.tld", // the email address the user entered on /{id}/exit/email
    pageExitedOn: "/form-a/your-address", // the page the user chose to exit on
  },
  //...
}
```

### ExitOptions.format - STATE

This mirrors the data in the user's state for the form that they chose to exit on. For example, if the user is filling out
two forms at once, /form-a and /form-b, if the user chose to exit on /form-a, only data from /form-a will be sent.

```json5
{
   "exitState": {
     "exitEmailAddress": 'jen@cautionyourblast.com',
     "pageExitedOn": '/test/how-many-people'
   },
   "progress": [ '/test/uk-passport', '/test/how-many-people' ],
   "checkBeforeYouStart": { "ukPassport": true },
   "applicantDetails": { "numberOfApplicants": '1 or fewer' }
 }
}
```

### ExitOptions.format - WEBHOOK

This mirrors the same format that data is sent when configuring a webhook output. You may just choose to store the data
as is, until the user decides to return. This makes it simpler calling [session-initialisation.md](./session-initialisation.md).

```json5
{
  name: "Digital Form Builder - Runner test",
  metadata: {},
  questions: [
    {
      category: "checkBeforeYouStart",
      question: "Do you have a UK passport?",
      fields: [
        {
          key: "ukPassport",
          title: "Do you have a UK passport?",
          type: "list",
        },
      ],
      index: 0,
    },
    {
      category: "applicantDetails",
      question: "How many applicants are there?",
      fields: [
        {
          key: "numberOfApplicants",
          title: "How many applicants are there?",
          type: "list",
          answer: "1 or fewer",
        },
      ],
      index: 0,
    },
  ],
  exitState: {
    exitEmailAddress: "jen@cautionyourblast.com",
    pageExitedOn: "/test/how-many-people",
  },
}
```

## Persistence API response

The persistence API (exitOptions.url) should return a 2xx status code if the data was successfully persisted. What
"successfully persisted" means depends on your implementation and requirements. This may mean successfully stored in your database,
or successfully inserted into a queue.

The response body must be JSON, and can some or none include the following properties:

- `redirectUrl` - a URL to redirect the user to after the data has been persisted. This can be used to redirect the user to a
  "success" page, or to a "hub" or "account" page.
  - The redirectUrl must be on the `safelist` (`SAFELIST` environment variable) to allow redirects to it. This is to protect the user from being redirected to an unknown URL.
    if the URL is not on the safelist, the user will be shown the runner's success page.
- `expiry` - The ISO date-time string of when the user's data will be deleted. This will be parsed in the format d MMMM yyyy (e.g. 9 July 2024) and shown to the user.

```json5
{
  redirectUrl: "https://your-service.service.gov.uk/success",
  expiry: "2024-07-09T00:00:00Z",
}
```

The user will be shown a generic error page if the request failed to send, or the API responded with a non 2xx code.
