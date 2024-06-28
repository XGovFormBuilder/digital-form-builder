# Session initialisation (rehydration)

Sessions may be inserted into the form runner, and then activated by a user, given that they have the token.

This is more suitable compared to [query-param-prepopulation](./designer/query-param-prepopulation.md) if you need to
prepopulate a lot of data or you do not want to send the user a URL with personal data in it.

The general flow is:

1. POST the user's session to `/session/{formId}`
1. The session will be stored in session storage (usually redis), as `{ [generatedToken]: sessionData }`
1. The POST request will respond with the generatedToken. The user will use this to activate their session
1. Your service sends the user (either by email, or showing them a URL on your service)
   to `https://runner-url/session/{generatedToken}`
1. The user will be redirected to the configured pages (or to the summary page by default)
1. The session data is copied from `{ [generatedToken]: sessionData }`, to where it would "usually" go, which
   is `{ [formId]: sessionData }`
1. Once activated, the token will be revoked, it cannot be used again

## Environment variables

| variable                      | type     | example               | description                                                                                                                                                                                                                                                                |
| ----------------------------- | -------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SAFELIST                      | string[] | your.service.gov.uk   | These are the allowed hostnames you wish to PUT data to, after the user has completed the form from a rehydrated session                                                                                                                                                   |
| INITIALISED_SESSION_TIMEOUT   | number   | 2419200000            | Time, in ms, you wish to keep a rehydrated session in the redis instance for. It will delete after this time if a user does not activate it                                                                                                                                |
| INITIALISED_SESSION_KEY       | string   | super-s3cure-p4ssw0rd | The user's token is generated with this key, similarly, the user's session is decrypted with this key. ⚠️ You must ensure this is set if you are deploying replicas. You must also ensure you re-issue tokens if you change this key.                                      |
| INITIALISED_SESSION_ALGORITHM | string   | HS512                 | HS512 is the default. You may use: `RS256`, `RS384`, `RS512`,`PS256`, `PS384`, `PS512`, `ES256`, `ES384`, `ES512`, `EdDSA`, `RS256`, `RS384`, `RS512`, `PS256`, `PS384`, `PS512`, `HS256`, `HS384`, `HS512`. ⚠️ You must reissue your tokens if you change this algorithm. |

## Initialising a session

See [session-initialisation-oas.yaml](./session-initialisation-oas.yaml) for the Open API specification.

Sample payload for POSTing to `/session/{formId}`:

```json5
{
  options: {
    callbackUrl: "https://b4bf0fcd-1dd3-4650-92fe-d1f83885a447.mock.pstmn.io",
    redirectPath: "/summary", // after session is activated, user will be redirected to ${formId}/${redirectPath}
    message: "Please fix this thing..", //message to display to the user on the summary page
    customText: {
      //same as ConfirmationPage["customText"]
      paymentSkipped: false,
      nextSteps: false,
    },
    components: [
      // same as ConfirmationPage["components"]
      {
        name: "WLskhZ",
        options: {},
        type: "Html",
        content: "Thanks!",
        schema: {},
      },
    ],
  },
  questions: [
    {
      fields: [
        {
          key: "size",
          answer: "Large firm (350+ legal professionals)",
        },
      ],
    },
    {
      question: "Can you provide legal services and support to customers in English?", // optional. This makes no difference, but it is what is originally sent on a "fresh" application
      category: "mySection", //optional - category is renamed to "section". You MUST provide the category/section if your form uses sections.
      fields: [
        {
          key: "speakEnglish",
          answer: true,
        },
      ],
    },
  ],
  metadata: { id: "abc-001" }, // any additional information you'd like to send to the callback Url
}
```

Sample response for POSTing to `/session/{formId}`:

```json5
{
  token: "efg-hi5-jk7",
}
```

The session will now be available for one time use at `localhost:3009/session/efg-hi5-jk7`. The user must submit the form,
otherwise they will need to request a token from you again.

You may generate and email tokens on an automated basis, for example, once a year. But it is recommended that you have a
"landing page" on an external application, which presents the user with a link or button. After clicking this link,
your external application should then generate the token, and redirect the user to it.
It means you do not have to worry about tokens expiring, or reissuing tokens if your INITIALISED_SESSION_KEY
or INITIALISE_SESSION_ALGORITHM has changed.
