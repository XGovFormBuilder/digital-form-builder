# Allow multiple instances of the same form to be completed concurrently 
## This is in PROPOSAL - feel free to add other options until a decision is made 
* Status: proposal
* Deciders: @jenbutongit - FCDO + HO 
* Date: 2021-05-24 

Technical Story: [description | ticket/issue URL] <!-- optional -->

## Context and Problem Statement

HO have a requirement that multiple instances of the same form may be completed currently, for example, two tabs may be open for the same form, but they will be different entries. 

## Decision Drivers <!-- optional -->

* Previously this was done by adding a URL Query parameter. GET/POSTs are intercepted and the parameter is copied for the redirect. 
  * It has not been investigated fully, but I suspect the copying/redirecting was causing issues for FCDO. Possibly because there was a point where it was not being copied correctly. See issue #152.
* possible a violation of URL standards
  * I (@jenbutongit) have asked the xgov content community. Although there is no official guidance, the general sentiment is not to fill the URL with "junk"


## Considered Options

* Instead of appending to the URL, add to the form action instead (visit param possibly to be renamed also?)
  * The session data will be stored against `${yar.id}:${formId}${!!visitId ? `:${visitId}` : ''}` if visitId is present
  * if this feature is required, we put the visit paramter inside the form action instead so it is abstracted from the user. `<form action="?visit=abc">`. This way we can intercept on POST - and know where to push the session data immediately
  * we can also add a hidden input, but would involve adding an input, posting, then trying to figure out with the hidden input which is the next page
* Use flash states (volatile state) to pass on the id to the next request 


## Decision Outcome

No decision yet! 

Chosen option: "[option 1]", because [justification. e.g., only option, which meets k.o. criterion decision driver | which resolves force force | … | comes out best (see below)].

### Positive Consequences <!-- optional -->

* URL is not littered with stuff that shouldn't concern the user too much

### Negative Consequences <!-- optional -->



## Pros and Cons of the Options <!-- optional -->

### [option 1]

[example | description | pointer to more information | …] <!-- optional -->

* Good, because [argument a]
* Good, because [argument b]
* Bad, because [argument c]
* … <!-- numbers of pros and cons can vary -->



## Links <!-- optional -->

* [Link type] [Link to ADR] <!-- example: Refined by [ADR-0005](0005-example.md) -->
* … <!-- numbers of links can vary -->
