# Save and return

- Status: proposed
- Deciders: FCDO / OS maintainers: [@jenbutongit](https://github.com/jenbutongit) [@superafroman](https://github.com/superafroman) [@alisalaman-cyb](https://github.com/alisalaman-cyb)
- Date: 2023-04-17
- Amended: 2023-04-17

## Context and Problem Statement

In some cases there is the necessity to have content flow over multiple lines to help with readability. Currently, you can add custom next steps text by appending the `specialPages.confirmationPage.customText.nextSteps` property to the form configuration object, however there is no way of doing this through the designer UI, and on top of this json strips out new line characters by default.

I think this gives us a good chance to decide how we want to make the next steps text editable, and to also re-evaluate how we print this variable in the nunjucks template.

This will also mark off [#723](https://github.com/XGovFormBuilder/digital-form-builder/issues/723) while we're looking into this.

Related issues:

- [#723](https://github.com/XGovFormBuilder/digital-form-builder/issues/723)

## Considered Options

Option 1:

1. Create a special pages edit component, which we can use in the future for other special page variables, but for the time being will just be used for confirmation page variables.
2. Next steps field added to component as long text field, allowing users to input text over multiple lines, but not add custom html
3. Add logic to split the inputted content into multiple strings in an array, using the line breaks as the delimiting character.
4. Update the form schema to allow an array of strings for the nextSteps variable as well as the current string value.
5. In the confirmation view template, change the line which populates the "next steps" area to show a partial for the next steps variable. This partial should have the conditional logic to show each line with break tags in between, or the single line string for backwards compatability.

Option 2:

1. Create a special pages edit component, which we can use in the future for other special page variables, but for the time being will just be used for confirmation page variables.
2. Next steps field added to component as html field based on current html field component.
3. On save, the html created should be saved as a standard string
4. In the statusService, where the model customText value is populated, check the nextSteps property to see if the string has any html tags, and if not, add p tags around the string
5. In the confirmation view template, change the line which populates the "next steps" area to add a `|safe` pipe to allow the html tags through

## Pros and Cons of the Options

# option 1

- Good, because it limits the amount of flexibility afforded to this area to avoid the area looking out of place
- Good, because it requires no html knowledge by the person updating the form
- Bad, because it involves updating the form configuration schema
- Bad, because the logic required to implement this feature may take longer and is a bit messier

# option 2

- Good, because the solution would be quick and easy to implement
- Good, because there is the possibility of more customisation than just line breaks if needed
- Bad, because pulling through html may have security concerns
- Bad, because the user updating the form will need basic html knowledge
