# Query parameter pre-population

In some cases users might have filled in their information on a different site before being directed through to your form. In these cases, it might be a better user experience for these bvalues to be pre-populated.

To allow this, the form builder supports query parameter pre-population, allowing values in the form to be pre-populated via query parameter.

## Setup

Access to query param pre-population is set at the component level.

To allow a field to be pre-populated, tick the "allow query parameter pre-population" checkbox on the field configuration:

![The query parameter pre-population field appears underneath the "expose to context" field in the field configuration panel](./query-param-field.png)

Once pre-population is allowed on a field, you can pre-populate that field by appending a query parameter with the component name to a form url e.g. `https://your-forms-url/your-form/target-page?firstName=Joe&lastName=Bloggs`.

## caveats

- For the time being, due to complications with validation, this functionality is only available to list type components e.g. select fields or autocomplete fields.
- If a field has pre-population enabled, but the user already has a form state with that field populated, then the incoming query parameter will be ignored.
- If the field is in a section, then the query param will need to be passed with dot notation e.g. `yourDetails.firstName=Joe`.
