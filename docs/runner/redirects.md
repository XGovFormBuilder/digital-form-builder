# Redirects

Pages in the form JSON can be configured to go to the next page in the form, or redirect to a new URL. This happens when the user
"continues" to the next page, and any field validations do not fail.

To redirect to another URL, it must be a fully qualified URL (i.e. not a partial path). This will be useful if your service can be completed by another service or site. You must manually change the JSON to enable this feature. It is currently not supported in the designer.

```json5
{
  title: "Start",
  path: "/start",
  section: "beforeYouStart",
  components: [
    {
      name: "country",
      type: "AutocompleteField",
      title: "Country",
      list: "SfkWjb",
    },
  ],
  next: [
    {
      path: "/second-page", // next page in form
    },
    {
      redirect: "http://localhost:3009/help/cookies", // a URL you wish to redirect to
      condition: "shouldRedirectToCookiesPage",
    },
  ],
}
```

To go to the next page in the form, in the `next` array, add:

```json5
{
  path: "/second-page", // page.path of the next page in the form
  condition: "..", // optional, set up a condition if you only want the user to go to this page if the condition succeeds
}
```

To redirect the user to another URL

```json5
{
  redirect: "http://localhost:3009/help/cookies",
  condition: "shouldRedirectToCookiesPage", // optional
}
```

It is good practice to always have a page that does not have a condition attached, making it the "default" page.
This way, if the conditions fail to evaluate, the user will not see an error.

See [redirects.json](../../e2e/cypress/fixtures/redirects.json) for a full example.
