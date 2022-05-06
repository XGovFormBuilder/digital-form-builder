# Save and return

* Status: proposed
* Deciders: FCDO / OS maintainers: [@jenbutongit](https://github.com/jen) [@superafroman](https://github.com/superafroman) [@alisalaman-cyb](https://github.com/alisalaman-cyb)
* Date: 2022-02-02
* Amended: 2022-02-21

### Amendments 2022-02-21
[Pull request](https://github.com/XGovFormBuilder/digital-form-builder/issues/760)
[Discussion/issue](https://github.com/XGovFormBuilder/digital-form-builder/issues/742)

The proposed `/returning-user` has been renamed to `/session`. To prevent issues with proxies, the token will now be
provided as a path parameter, rather than a search parameter. 


## Context and Problem Statement

A common requirement for UK Government forms or more generally long forms is to be able to revisit a form without losing progress. 
Currently the session TTL can be configured via environment variable, or defaults to 20 minutes. 
There have also been related feature requests where a form can be "passed on" to another user to complete. 

Related issues:
- [#561](https://github.com/XGovFormBuilder/digital-form-builder/issues/561)
- [#639](https://github.com/XGovFormBuilder/digital-form-builder/issues/639)
- [#640](https://github.com/XGovFormBuilder/digital-form-builder/issues/640)


## Considered Options

Option 1:
* #639 (although this may be implemented at another time for a different requirement)

Option 2:
1. add a new endpoint for the runner `/returning-user` which accepts POST request, with JSON body containing the user's answers and additional data
  - There may be additional flags to hide fields or prevent editing
  - This should also include where the data should be sent submission (in WebhookOutput format) 
2. The data is then saved to the runner's session storage (usually Redis) against a random id and a longer TTL so that a user has time to make the changes (i.e. 48 hour expiry time) 
3. If (2) is successful, return a successful response containing the `${token}` that must be used to access this session
4. user navigates to `https://runner/returning-user?id=${token}`
5. `CacheService` must copy the session stored at `${token}` to the user's session which is stored at `${request.yar.id}`
6. when a user submits the form, it will be `PUT` to wherever specified


See supplementary sequence diagram (with example 3rd party integration) [0002-sequence-diagram.svg](./0002-sequence-diagram.svg)


## Decision Outcome

Option 2 will fit FCDO's requirements around security and DPIA. It will also have additional controls so that it can be customised and implemented in different systems. 


Implementing 639 does not give us enough control, especially with unauthenticated flows. 
There is a risk of a user finding a link which has query parameters set and ends up submitting someone elses data.


### Positive Consequences <!-- optional -->

A long awaited feature. Sorry for anyone who's been waiting for this!

### Negative Consequences <!-- optional -->

This will not be as "simple" as query parameters, and will require more involvement by the implementors so that steps 3-4 are handled correctly.

