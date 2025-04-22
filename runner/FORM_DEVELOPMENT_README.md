# Form development on ukhsa-collaboration/digital-form-builder

## Commit your service form

To commit your service form, save it into the `/runner/src/server/forms` folder.

## Setting custom help pages

To set customised help pages for your service, such as accessibility statement, privacy policy or cookie policy, you need to create a service named folder in `/runner/src/server/views` with the relevant pages.

ie.

```
YourServiceName/cookies.html
YourServiceName/accessibility.html
```

The `/runner/src/server/plugins/router.ts` is configured to capture the service (or form) name present in the URI path and route to customised help pages if they exist or revert back to default ones.

The route will supply your form name into the page where you can reference it via `{{ name }}`. This is the name set within your form config .json file located in `/runner/src/server/forms`.

## Setting authentication

TBC
