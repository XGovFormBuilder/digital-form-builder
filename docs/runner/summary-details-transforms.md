# Summary details transforms

In some cases, you may want to modify the data that is displayed in the summary details component.
This can be achieved by using transforms. Transforms allow you to manipulate the SummaryViewModel.details before they are rendered.

Transforms are keyed by `FormModel.basePath`. In most cases, this will be filename of the form's JSON.

Each transform is a function that takes the `SummaryViewModel.details` as an argument and returns the modified details.

## Configuring transforms

Transforms can be configured in two ways depending on your setup.

### Replace `runner/dist/server/transforms/summaryDetails` using the docker `COPY` command

This is suited for organisations that do not need to modify the source code of the form runner.
[View an example of how to customise forms and views using docker only](https://github.com/XGovFormBuilder/form-builder-examples/tree/main/production-docker).

This is the recommended approach if you are not using any custom code (i.e. using the "vanilla" features). Build times will be significantly faster since you do not need to compile any code. It also removes the risk of fork drift.

> ⚠️ Warning: At a minimum, these transforms must be written in the commonjs format
>
> You may write your transforms in TypeScript, but they must be compiled to commonjs before being used in the form runner.

1. Create the directory `summaryDetails` in your project
2. Add an `index.js` file in the `summaryDetails` which exports your transformations, which is an object that is keyed by form basePath
   ```js
   // summaryDetails/index.js
   "use strict";

   const summaryDetailsTransformations = {
     "marriage-in-spain": (details) => {
       // Replace section title with the partner's name
       const partnerSection = details.find(
         (section) => section.name === "partnerDetails"
       );
       const partnersName = partnerSection.items.find(
         (item) => item.name === "partnerName"
       )?.value;

       const modifiedSections = details.map((section) => {
         if (section.name === "partnerDetails") {
           const copy = { ...section };
           copy.title = `Partner's Details (${partnersName})`;
           return copy;
         }
         return section;
       });

       // Uppercase all the answers
       return modifiedSections.map((section) => {
         return section.items.map((item) => {
           return { ...item, value: item.value.toUpperCase() };
         });
       });
     },
   };

   // A default export for the transformations are required (not named exports!)
   module.exports = summaryDetailsTransformations;
   ```
3. In your Dockerfile, copy the `summaryDetails` directory to the `runner/dist/server/transforms/summaryDetails` directory:
  ```dockerfile
ARG BASE_IMAGE_TAG="3.26.1-rc.964"
FROM ghcr.io/xgovformbuilder/digital-form-builder-runner:$BASE_IMAGE_TAG as base
ARG FORMS_DIR="forms"
WORKDIR /usr/src/app
RUN rm -r runner/dist/server/forms && rm -r runner/src
COPY $FORMS_DIR runner/dist/server/forms
COPY transforms/summaryDetails runner/dist/server/transforms/summaryDetails

CMD [ "yarn", "runner", "start"]
  ```
4. Build your Docker image and run it. You should see the transformed summary details when you go to the summary page of your form
   
    
