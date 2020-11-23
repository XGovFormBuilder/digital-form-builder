# Page Controllers

Form pages could have specific controllers and this is specified inside the Form JSON, please see below a sample where the page summary is specifying it's controller via `controller` property.

```javascript
{
    "pages": [
        {
            "path": "/summary",
            "controller": "./pages/summary.js", // legacy controller path
            "title": "Summary",
            "components": [],
            "next": []
        },
        {
            "path": "/summary",
            "controller": "SummaryPageController", // we now use the controller class name
            "title": "Summary",
            "components": [],
            "next": []
        }
    ]
}
```

Previously controllers were dynamically loaded from the file system, this is why you see a path such as `./pages/summary.js`. This feature has never been used since the application was forked and so it has been deprecated.

To keep backward compatibility with legacy forms JSON we have the `getPageController` helper dealing with the possibility of a controller value being a file path or a class name (see `helpers.ts`)
