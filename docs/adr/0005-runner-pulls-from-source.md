# Change the runner to pull forms from a source

- Status: [proposed]
- Deciders: OS maintainers [@jenbutongit](https://github.com/jenbutongit) [@superafroman](https://github.com/superafroman) [@ziggy-cyb](https://github.com/ziggy-cyb)
- Date: [2023-11-28 when the decision was last updated]

## Context and Problem Statement

Currently, when the user saves the form, it sends the entire form to the server, which optionally saves the form to S3 if configured, then  
sends a post request to the runner (in preview mode), to `/publish`, and the form is initialised and saved in memory.

For production environments, we recommend that you replace the docker images files `dist/server/forms` with the forms that should be available on startup, and have PREVIEW_MODE turned off.

## Decision Drivers

- Desire to make this into a SaaS product!
- Forms can be accessed when published, without having to redeploy

## Considered Options

- [option 1] Forms are no longer "pushed" to the runner. The runner would be configured with a source
  (e.g. S3, mountpoint/filesystem/database/designer) and would pull forms and initialise them if requested.

## Decision Outcome

Chosen option:

## Pros and Cons of the Options

### [option 1]

When a user requests a form at /forms/:id, the runner will pull from the configured source, and initialise the form.
This gives developers flexibility on how they wish to store, manage and "publish" forms. Newly published forms will therefore always be "available".

When horizontally scaling the pod, it does not need to initialise all the forms that have been published or on the image, only the ones that were requested of that pod.
There may still need to be a way to "register" which pods have which forms, and prioritise requests to pods that have the form already initialised.
Session stickiness may also be required (to prevent a user from being redirected to a pod that does not have the form initialised).

Handling different versions of forms should also be considered. We can send, in the metadata, the version of the form. The webhook can then determine what to do with this version.

For the designer "source", we would just be moving the /publish and /published endpoints from the runner to the designer.

### [option 2]
