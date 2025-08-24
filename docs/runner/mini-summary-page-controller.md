# MiniSummaryPageController

Below is an example of a page utilising this controller. It will display a summary of the form data in the section "YourDetails":

```json5
{
  "title": "Check these details are correct before continuing",
  "path": "/check-your-details",
  "components": [],
  "next": [{ "path": "/next-page" }],
  "controller": "MiniSummaryPageController",
  "section": "YourDetails"
}
```