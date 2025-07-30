# Repeating fields

A page with a single field can be set to repeat, allowing the user to add multiple entries of the same field.

There are also multiple display modes. You can choose to display the previously entered fields

- On the same page as the question
- On a separate page
  - This page is added automatically for you, you do not need to add it to the form JSON
  - The title on the separate page is configurable
- Both on the same page and the separate page

It is also possible to hide the row titles in the summaries.

> [!NOTE]
> This feature currently only works for pages with a single field on it

## screenshots

### Repeating summary on the same page

![Repeating summary on the same page](https://github.com/user-attachments/assets/50538af6-f431-493c-8f68-63323d41d7e6)

### Repeating summary on a separate page

![Repeating summary on a separate page](https://github.com/user-attachments/assets/c8807cbc-a287-481d-a3af-560227848418)

### Final summary page (end of the form)

![Final summary page (end of the form)](https://github.com/user-attachments/assets/77a32e83-7367-4803-9435-735dd4b1774f)

## Configuration

To toggle a repeating page behaviour, set the controller to `"controller": "RepeatingFieldPageController"`

Add options to the page if you want to customise the summary display behaviour. The table below shows the available options and default behaviour.

```json5
{
  path: "/which-languages-do-you-translate-or-interpret",
  title: "Which languages do you translate or interpret?",
  controller: "RepeatingFieldPageController",
  options: {
    summaryDisplayMode: {
      samePage: true,
      separatePage: false,
      hideRowTitles: false,
    },
    customText: {
      separatePageTitle: "You have selected these languages",
    },
  },
}
```

### Summary display mode options

| Option          | Type      | Description                                                                                | Default |
| --------------- | --------- | ------------------------------------------------------------------------------------------ | ------- |
| `samePage`      | `boolean` | If true, the previously entered fields will be displayed on the same page as the question. | `false` |
| `separatePage`  | `boolean` | If true, the previously entered fields will be displayed on a separate page.               | `true`  |
| `hideRowTitles` | `boolean` | If true, the row titles will be hidden in the summaries.                                   | `false` |

### Custom text options

| Option              | Type     | Description                                                                 | Default                         |
| ------------------- | -------- | --------------------------------------------------------------------------- | ------------------------------- |
| `separatePageTitle` | `string` | The title of the separate page that displays the previously entered fields. | The title of the repeating page |
