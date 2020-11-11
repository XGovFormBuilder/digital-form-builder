# Page Controllers

TODO: Refactor to load page controllers from memory instead of depending on path and dynamic require.
ATM page controllers are dynamically loaded based on form schema specification, see the json below in `pages[0].controller`.
These controllers should exist in memory instead of depending on file path, so ideal controller prop should just indicate the name of the controller and not the file path.
We need to reimplement this with backward compatibility (extract controller name from path).

```javascript
{
    "pages": [
        {
            "path": "/summary",
            "controller": "./pages/summary.js",
            "title": "Summary",
            "components": [],
            "next": []
        }
    ]
}
```
