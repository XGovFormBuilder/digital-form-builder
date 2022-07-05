# Save Per Page

- Status: **proposed**
- Deciders: Jen Duong (jenbutongit), Enda McCormack (endamccormack)
- Date: 2022-05-22 (last updated)

## Context and Problem Statement

Users can return to the form runner with pre-existing state using this handler: [initialize session](https://github.com/XGovFormBuilder/digital-form-builder/pull/760/files). There is no known way to exit a form journey mid-way through (a form with incomplete answers) and save this state externally for reuse at some future point.

This request proposes the provision of a mechanism to save and exit from a form. As currently available on form completion and submission, this change should provision an outbound hook to save partially completed form state to a third party service, either periodically (e.g after every question submission) or after the user has explicitly requested to 'save and exit'.

A Save and Exit would include sending partially completed form state to a specified output, possibly using the same output object specified in the json configuration.

## Decision Drivers

- When users are completing large journeys, they may want to 'save and exit' their progress and return to their form for completion at some future point. The form builder does not persist state permanently so it would be useful to have the partial state captured in a permanent store for form rehydration at some future point.

## Considered Options

- save and exit option/button on summary page
- save and exit option/button on each page
- autosave flag: an automatic hook when there is a question post on each page
- prompt the user on form exit to 'save and exit'

## Decision Outcome

Chosen option (draft): "autosave", because this provides the most up-to-date state from the runner to an external service on the most regular basis possible.

- need to decide how the autosave flag should be implemented (env var?)
- need to decide the criteria for the autosave hook (should it be on every question or every section etc)

### Positive Consequences

- An external service will be provided partial form state so they can utilise the rehydration hook

### Negative Consequences

- higher network traffic between form runner and external service
- more complexity in runner code
- need to ensure that on final submission answers are still validated

## Pros and Cons of the Options

### save and exit button

Provide a 'save and exit' button as a form exit point to partially complete a form and send the current state to an output.

- Good because, an external service will be provided partial form state so they can utilise the rehydration hook
- Good, because it involves one call on form exit rather than many calls whenever there is an update to state

- Bad, because a 'save and exit' button could disrupt the users UI flow and this may adversley effect accessibility
- Bad, because unless the user utilises the 'save and exit' feature, data will still be lost

### summary page partial submit

When mid-journey but ready to save and exit, the user navigates to the summary page and save and exits from there.

- Good because, an external service will be provided partial form state so they can utilise the rehydration hook
- Good, because the user will see a summary of what they are saving (complete/incomplete answers)
- Good, because there is one page to perform the 'save and exit' action

- Bad, because there is currently no known way to navigate to the summary page mid-journey (other than url)
- Bad, because unless the user utilises the 'save and exit' feature, data will still be lost

### prompt the user on form exit to 'save and exit'

When the user exits the runner form mid-journey detectable via window.onbeforeunload, prompt to 'save and exit'

- Good because this will catch the user leaving the session rather than rely on them using the UI activated 'save and exit' mechanism
- Bad because the implementation is not good pratice when considering journey mapping
- Bad because its completely reliant on Javascript
- Bad because there is no obvious mechanism for the user to save their progress
