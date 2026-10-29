# Repeated Multi-Field Page Controller

The repeated multi-field page controller extends the design of the repeated page controller. Instead of repeating a single field, it lets the user add a **group of fields** multiple times, storing each group as an item in an array.

For example, to collect a list of people with a first name, last name and date of birth, you can use a single page with this controller rather than building a separate page for each person.

## Usage

Set the page's `controller` to `RepeatedMultiFieldPageController` and give it a `sectionKey` in `options`.

`sectionKey` must be unique across the form. It identifies the repeated data in state and in the webhook payload, and is deliberately separate from the card title so the display text can change without affecting stored data.

```json
{
  "path": "/repeated-page",
  "title": "Details of the person {{ PersonalInformation.for }}'ve been in close contact with",
  "controller": "RepeatedMultiFieldPageController",
  "options": {
    "sectionKey": "example-unique-section-key",
    "customText": {
      "cardTitle": "Close Contact {index}"
    }
  },
  "components": [
    {
      "name": "first_name",
      "type": "TextField",
      "title": "Close contact first (given) name",
      "options": {
        "customValidationMessages": {
          "string.pattern.base": "Enter a valid first (given) name"
        }
      }
    },
    {
      "name": "last_name",
      "type": "TextField",
      "title": "Close contact last (family) name",
      "options": {
        "customValidationMessages": {
          "string.pattern.base": "Enter a valid last (family) name"
        }
      }
    }
  ],
  "next": [{ "path": "/next-page-example" }]
}
```

## How it works

1. The page's components are displayed as a normal form page.
2. When the user submits, the values are saved under the page's `sectionKey` and the POST handler redirects to the repeat summary page.
3. The repeat summary page lists each saved item as a card, built from the values stored under `sectionKey`. Each card has **Edit** and **Delete** actions.
4. From the repeat summary page, the user can either:
   - **Add another**, which shows a blank form page for a new item, or
   - **Continue** to the next page in the form as normal.
5. The user completes the rest of the form as usual.
6. From the final summary page, the user can:
   - **Edit** an individual item directly, or
   - **Add** or **Delete** items, which takes them to the repeat summary page.

## Summary page support

The repeated section is displayed on the final summary page. When rendering, the summary page controller calls the component's summary view so each repeated item is listed.

The summary page also shows a button that takes the user back to the repeat summary, where they can add or remove items. This is added in `runner/src/server/views/summary.html`.

### Persisting `returnUrl`

When the repeat summary is opened from the main summary page with a `returnUrl`, the controller preserves it through every action inside the component: **Add another**, **Change**, **Remove** and **Continue**.

These internal redirects don't go through the base controller's `proceed` method, so the controller appends `returnUrl` itself using the `withReturnUrl` helper. It is added to each redirect, each link and the summary form's `action`.

- Only local paths are accepted: they must start with `/` and must not start with `//`.
- On **Continue**, the user is sent back to `returnUrl` instead of the next page.

## Webhook support

The controller implements a `toWebhookQuestions` method, which lets a page define how its data is formatted for the webhook payload. This keeps page-specific extraction logic inside the page rather than in the webhook model.

It is called from:

```
runner/src/server/plugins/engine/models/submission/WebhookModel.ts
```

## Options

### `sectionKey` (required)

Type: `string`

Unique key used to store the repeated items in state and to identify them in the webhook payload. See [Usage](#usage).

### `hideFieldChangeLinksOnRepeatSummary`

Type: `boolean` — Default: `false`

Set `options.hideFieldChangeLinksOnRepeatSummary` to `true` to hide the per-field **Change** links inside cards on the intermediate repeat summary page (`?view=summary`). This does not affect the final summary page.

### `hideFieldChangeLinksOnMainSummary`

Type: `boolean` — Default: `false`

Set `options.hideFieldChangeLinksOnMainSummary` to `true` to hide the per-field **Change** links inside cards on the final summary page. This does not affect the intermediate repeat summary page.

Both options go directly inside the page's `options`, alongside `sectionKey`. They are independent: set either one or both to `true` as needed. For example, setting `hideFieldChangeLinksOnRepeatSummary` to `true` and `hideFieldChangeLinksOnMainSummary` to `false` hides field links only on the intermediate summary; reversing those values hides them only on the final summary. Omitting either option keeps its field links visible.

These options only hide per-field links. They do not disable editing or change the card-level **Change** action, **Delete** action, or **Add another** / **Add or delete** controls where available.

### `customText`

Optional overrides for text shown by the controller. The summary view is open to extension if more custom text parameters are needed.

#### `customText.cardTitle`

Type: `string` — Default: `"Item"`

Sets the title shown on each card in the repeat summary. Use `{index}` to include the item's number, e.g. `"Close Contact {index}"` renders as "Close Contact 1", "Close Contact 2" and so on.

#### `customText.separatePageTitle`

Type: `string`

Sets a custom title on the separate repeat summary page.

### `yesNoSummaryQuestion`

Type: `string` — Default: none

By default, users add another item using an **Add another** button. If you set this parameter, the button is replaced with a yes/no question, and the string you pass becomes the question text.
