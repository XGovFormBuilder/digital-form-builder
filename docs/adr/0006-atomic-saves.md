# Designer - Atomic saves on the server

- Status: [proposed]
- Deciders: OS maintainers [@jenbutongit](https://github.com/jenbutongit) [@superafroman](https://github.com/superafroman) [@ziggy-cyb](https://github.com/ziggy-cyb)
- Date: [2023-11-28 when the decision was last updated]

## Context and Problem Statement

Currently, when a form is edited, changes are made to a version of the form saved in memory on the browser (react state).
When the user saves, it sends the entire form to the server to be validated and then persisted.

## Decision Drivers <!-- optional -->

- Handling state (entirety of the form) on the client can get complex and difficult to test
- Saving "chunks" of the form can help with analytics or future features like edit history
- The designer is entirely client side rendered, it will not work without javascript enabled
  - React server side components is not performant. (Neither is React for that matter!)
- By splitting the designer, it allows the community to "bring their own frontend" (they do not need to use GOV.UK styles)

## Considered Options

- [option 1] Move persistence to the designer server, and make the form a RESTful resource
  - When the user edits a component, or page etc, this should send a request to the designer server, save, and return the updated form. The server becomes responsible for making the mutation to the persisted form.
  - Since every "thing" in the form (components, page, etc) has an id, and some "things" being nested children (like list items or components), form JSONs can easily follow a RESTful structure.
- [option 2] Rewrite the whole thing in Svelte(Kit) (or more sensibly, next.js)

## Decision Outcome

Chosen option: [option 1].

### [option 1]

Most of the application is using reducers to manage state. For example, list reducers, are already split into distinct actions.
That gives us the option to

- migrate gradually, action by action
- migrate gradually, by reducer type (list, component, page)

At first, the designer (client) will have to construct the URLs for the request.

The form resource may look like this:

```
GET | POST | PUT /forms/:id
GET | POST | PUT /forms/:id/pages/:pagePath
GET | POST | PUT /forms/:id/pages/:pagePath/next
GET | POST | PUT /forms/:id/pages/:pagePath/title
GET | POST | PUT /forms/:id/pages/:pagePath/components/:componentId
GET | POST | PUT /forms/:id/lists/:listId
GET | POST | PUT /forms/:id/lists/:listId/items/:itemId
```

The post requests, can send an action name, and the payload (this is how the reducers currently work), and the server will make the change.

The get request can either be used to just return the JSON, or render the page which allows the user to edit this component.
For example, to edit the component "name" on "/passport-details", the URL would be `/forms/:id/pages/passport-details/components/name`.
When the user submits the form on this page, it will post the same URL, with the action and payload. We can then use the post, redirect, get pattern to render the page with errors (if any).

#### Positives

- Accessibility and usability
  - React and "the React way" makes it difficult for developers to think about accessibility and usability
- Handling multiple versions of the schema is simpler. We can just mount the routers to /v1, /v2
- Testing is simpler
- More developer "concurrency" (both frontend and backend development can happen simultaneously)
- No longer mutating the entire form and sending, which makes the editing process "safer"
- We can explore using GOV.UK nunjucks to render the pages in future, which allows us to keep components up to date easily. React GOV.UK components are only provided as open source projects

#### Negatives

Client side rendering is often a consideration to reduce server load, so we will be losing this. But at low volumes of traffic it is not a concern.
It's also a lot of work (even if it can be done incrementally)

### Rewrite in a web meta framework like next.js

#### Positives

Following the same API design as option 1, we would use next.js (because it is already compatible with react). Next.js can provide server side rendering, and file system based routing.
Developer experience of meta frameworks is typically very good.

#### Negatives

This would have to be worked on in parallel to the current designer, and released all at once. It also introduces tight coupling between the server and frontend.

## Links <!-- optional -->

- [Link type] [Link to ADR] <!-- example: Refined by [ADR-0005](0005-example.md) -->
- … <!-- numbers of links can vary -->
