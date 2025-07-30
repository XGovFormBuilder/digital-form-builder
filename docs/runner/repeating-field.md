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

<img width="967" height="576" alt="Repeating field on the same page" src="https://github.com/user-attachments/assets/e0831f2b-f511-4ede-b975-7c6367011a22" />

### Repeating summary on a separate page

<img width="736" height="404" alt="Repeating summary on a separate page" src="https://github.com/user-attachments/assets/58a2acdb-18a2-4e6b-ad29-6d6b3198f83a" />

### Final summary page (end of the form)

<img width="672" height="256" alt="Final summary page (end of the form)" src="https://github.com/user-attachments/assets/79985578-10db-4438-b192-1b004d206411" />

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
