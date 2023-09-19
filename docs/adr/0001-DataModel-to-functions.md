# Refactor DataModel class to functions

* Status: accepted
* Deciders: Home Office. Proposed by [https://github.com/jenbutongit](jenbutongit)
* Date: [2021-05-07 when the decision was last updated]

Technical Story: [https://github.com/XGovFormBuilder/digital-form-builder/issues/495](https://github.com/XGovFormBuilder/digital-form-builder/issues/495)

## Context and Problem Statement

The Data class (or data-model.ts) is a class responsible for mutating the form JSON. It was within /model, where we keep shared code.
Data-model was only responsible for mutating data (and storing these changes as properties). The most appropriate place for it to be is the designer where data mutation happens,
however React and react state management libraries discourage storing state in this way.


## Decision Drivers

* Storing state in classes is discouraged. And straight up not allowed in redux! It could interfere with the React diffing algorithm.
* using a method on a class may cause multiple rerenders when not necessary (e.g. inside c.updateX(), c.updateY() is also called) when we can just setState({x, y}). Most react state management libraries (like redux) will actively warn and throw errors if a class is detected within the state.
* In all cases of the methods which mutate the data were used, the class is "cloned" - which involves deserialising the data, then reserialising in a new data object, mutated, then has to be deserialised again to be posted to the server. We can skip all (de)serialising steps if it is a plain object. javascript is able to interpret JSON without these steps
* For tests, the more you mock, the further away from the code you get. Less mocks => more real code => more confidence
* data-model.test.ts was over 1200 lines.
  * A lot of these tests had multiple mocked methods in the same test case.. see above point!
  * Because there was so much mocking and initialisation of a new class, it made the tests hard to read and hard to maintain



## Considered Options

* Refactor the methods into hooks or functions that belong inside the designer workspace


## Decision Outcome

Functions were written instead of hooks, since hooks are angled at state management but in all cases, the data class was cloned into a new instance, then mutated to be posted to the designer API. Calling the functions were a more like-to-like replacement.

### Positive Consequences <!-- optional -->

* The functions have been tested to a higher coverage % (100% or close to) - without the need for mocking
* Less code and tests to manage


### Negative Consequences <!-- optional -->

* model now has slightly lower coverage. I suspect because it was such a huge chunk of the workspace..
