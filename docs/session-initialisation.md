# Session rehydration

Sessions may be inserted into the form runner, and then activated by a user, given that they have the token.

This is more suitable compared to [query-param-prepopulation](./designer/query-param-prepopulation.md) if you need to
prepopulate a lot of data or you do not want to send the user a URL with personal data in it.

The general flow is:

1. POST the user's session to `/session/{formId}`
1. The session will be stored in session storage (usually redis), as `{ [generatedToken]: sessionData }`
1. The POST request will respond with the generatedToken. The user will use this to activate their session
1. Your service sends the user (either by email, or showing them a URL on your service) to `https://runner-url/session/{generatedToken}`
1. The user will be redirected to the configured pages (or to the summary page by default)
1. The session data is copied from `{ [generatedToken]: sessionData }`, to where it would "usually" go, which is `{ [formId]: sessionData }`
1. Once activated, the token will be revoked, it cannot be used again

## Environment variables

| variable                    | type     | example               | description                                                                                                                                                                                                                        |
| --------------------------- | -------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SAFELIST                    | string[] | your.service.gov.uk   | These are the allowed hostnames you wish to PUT data to, after the user has completed the form from a rehydrated session                                                                                                           |
| INITIALISED_SESSION_TIMEOUT | number   | 2419200000            | Time, in ms, you wish to keep a rehydrated session in the redis instance for. It will delete after this time if a user does not activate it                                                                                        |
| INITIALISED_SESSION_KEY     | string   | super-s3cure-p4ssw0rd | The user's token is generated with this key, similiarly, the user's session is decrpyed with this key. You must ensure this is set if you are deploying replicas. You must also ensure you re-issue tokens if you change this key! |

## Initialising a session
