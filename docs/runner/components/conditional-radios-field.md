# Conditional radios field

The conditional radios field displays a list of radio options and lets the user enter a custom value when none of the fixed options apply. The custom text input is shown when the user selects the `TextField` item in the list.

## Configuration

Add a component with `"type": "ConditionalRadiosField"` to a page's `components` array. The component uses the list named by the `list` property:

```json5
{
  name: "title",
  type: "ConditionalRadiosField",
  title: "Title",
  list: "titlesList",
  options: {
    customValidationMessages: {
      "any.required": "Select a title",
    },
  },
}
```

The list should contain fixed radio options, a divider, and a `TextField` item for the custom value:

```json5
{
  name: "titlesList",
  type: "List",
  items: [
    { type: "HiddenField", value: "mr", label: "Mr" },
    { type: "HiddenField", value: "mrs", label: "Mrs" },
    { divider: "or" },
    { type: "TextField", label: "Other title" },
  ],
}
```

Fixed options can use any list item type except `TextField`, and should provide a `value` and a `label` (or `text`). The `TextField` item is rendered as the custom text input. Its `label` is used as the label for that option. A divider can be used to separate the fixed options from the custom option.

## Submitted value

The component stores the selected fixed option's label in form state. When the custom option is selected, it stores the text entered by the user. A custom value can also be submitted directly without selecting the custom option.

The custom option must have non-empty text. The field is invalid when no fixed option or custom value is submitted.

## Options

The component supports the shared list-field options, including `customValidationMessages` and `exposeToContext`.
