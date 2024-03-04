# Multi-page start pages

Sometimes in your service it might be necessary to implement a multi-page start page, for example if there's two much content on one page.

The form builder has a special page controller which can be used to achieve this effect. The controller matches the styles of the [carer's allowance start page](https://www.gov.uk/carers-allowance), the example for multi-page start pages, as closely as possible.

## How it works

To convert a standard page into a multi-page start page, you will need to add the following properties to your page definition:

```json5
{
  controller: "MultiPageController",
  startPageNavigation: {
    previous: {
      labelText: "Previous page",
      href: "/form-name/previous-page",
    },
    next: {
      labelText: "Next page",
      href: "/form-name/next-page",
    },
  },
}
```

This will then create the page as a multi-page start page, with the previous and next page as paginated links.

### Properties

These are the multi-page specific properties which are either required or can be used to use other multi-page features.

#### startPageNavigation - required

`startPageNavigation` is a required property which is used to populate the pagination at the bottom of the page.

It has a `previous` and `next` property which are used to populate each link, however both of these properties are optional in case a previous or next link cannot be specified.

#### showContinueButton - optional

`showContinueButton` is an optional property that defines whether the continue button should be shown on the page. The continue button is hidden by default, however if the flag is set `showContinueButton: true`, a continue button will be shown above the pagination footer.

#### continueButtonText - optional

`continueButtonText` defines the text to be shown on the continue button. By default, the button will say "Continue", however it may be necessary for you to have different text for your call to action e.g "Apply now".

### Recommendations

For the multi-page start pages to work with the form they must be in the main flow of the form i.e between the first page and the summary page of the form. With this in mind, to get the desired effect of the start pages, your page that leads to the rest of the form should have `showContinueButton: true` and should be placed before the actual start of the form.

An example of this can be seen by looking at the `multi-page-example` form.

If you want your call to action page to appear part way through your start pages, link this page to the start of your form questions, and keep the following start pages in an unreachable branch in the form. This way your latter start pages can still be accessed through the pagination in your start pages, however won't interrupt the flow of the form at all.

The guidance for multi-page start pages advises putting all of your start pages under a shared heading, and then having a sub-heading outlining the name of the page. The best way to achieve this effect is to name all your start pages with the shared heading, but different paths, and then to add an HTML component with an `<h2>` element providing your section title.
