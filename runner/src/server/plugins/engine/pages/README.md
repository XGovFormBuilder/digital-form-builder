# Page Controllers

TODO: Refactor to load page controllers from memory instead of depending on path and dynamic require.
Motivation: The way this is implemented ATM adds a lot of complexity and restrictions, for example folder and files can't be renamed or moved, files must maintain `module.exports` for dynamic require instead of fully move to ESM, forms configuration JSON must hold partial path for these files instead of just the controllers names.

ATM page controllers are dynamically loaded based on form schema specification, see the json below in `pages[0].controller`.
These controllers should exist in memory instead of depending on file path and dynamic require, the ideal controller prop value should just indicate the name of the controller and not the file path.
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
