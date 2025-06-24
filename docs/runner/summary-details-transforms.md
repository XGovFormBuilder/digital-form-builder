# Summary details transforms

In some cases, you may want to modify the data that is displayed in the summary details component.
This can be achieved by using transforms. Transforms allow you to manipulate the SummaryViewModel.details before they are rendered.

Transforms are keyed by `FormModel.basePath`. In most cases, this will be filename of the form's JSON.

Each transform is a function that takes the `SummaryViewModel.details` as an argument and returns the modified details.
Transform functions are given a deep _copy_ of details, rather than a reference to prevent accidental mutations.

Transforms are placed in the `runner/src/server/transforms` directory. This is so that they can be easily replaced using the Docker `COPY` command.
They are imported by [`SummaryViewModel.detailsTransformationMap.ts`](./../../runner/src/server/plugins/engine/models/SummaryViewModel.detailsTransformationMap.ts),
which will either load the [source code transforms](./../../runner/src/server/transforms/summaryDetails/index.ts) checked into the repository, or the aforementioned replacement.

## Configuring transforms

Transforms can be configured in two ways depending on how you build the runner docker image.

### Replace `runner/dist/server/transforms/summaryDetails` using the docker `COPY` command

This is suited for organisations that do not need to modify the source code of the form runner.
[View an example of how to customise forms and views using docker only](https://github.com/XGovFormBuilder/form-builder-examples/tree/main/production-docker).

This is the recommended approach if you are not using any custom code (i.e. using the "vanilla" features). Build times will be significantly faster since you do not need to compile any code. It also removes the risk of fork drift.

> ⚠️ Warning: At a minimum, these transforms must be written in the commonjs format
>
> You may write your transforms in TypeScript, but they must be compiled to commonjs before being used in the form runner.

1. Create the directory `transforms/summaryDetails` in your project
   ```
   .
   └── transforms
       └── summaryDetails
           └── index.js
   ```
2. Add an `index.js` file in the `summaryDetails` which exports the transformations, which is an object that is keyed by form basePath

   ```js
   // transforms/summaryDetails/index.js
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
         section.items = items.map((item) => {
           return { ...item, value: item.value.toUpperCase() };
         });
         return section;
       });
     },
   };

   // A default export for the transformations are required (not named exports!)
   module.exports = summaryDetailsTransformations;
   ```

3. In the Dockerfile, copy the `summaryDetails` directory to the `runner/dist/server/transforms/summaryDetails` directory:

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

4. Build the Docker image and run it. The transformed summary details will appear when navigating to the summary page of the form.

#### Reusing transforms across multiple forms

To reuse the same transforms, or reduce the size of `summaryDetailsTransformations`, transforms can be split across multiple files.

1. Create a new file for the transform that should be abstracted, for example `marriage.js`, the directory structure should look like this:
   ```
   .
   └── transforms
       └── summaryDetails
           ├── index.js
           └── marriage.js
   ```
2. In the new transform file (in this example `marriage.js`), create add the transform and default export it in the commonjs format:

   ```js
   // transforms/summaryDetails/marriage.js
   "use strict";

   function marriageTransform(details) {
     // modify details
   }

   module.exports = marriageTransform;
   ```

3. In the `index.js` file, import the transform and add it to the `summaryDetailsTransformations` object:
   ```js
   // transforms/summaryDetails/index.js
   "use strict";
   const marriageTransform = require("./marriage");
   const summaryDetailsTransformations = {
     "marriage-in-spain": marriageTransform,
     "marriage-in-france": marriageTransform,
     feedback: (details) => {},
   };
   ```

### Write transforms in the form runner source code

This is suited for organisations that use a fork XGovFormBuilder, and already have significant custom source code.
These organisations typically build their docker images from source code.

For this method, you may write your transforms in TypeScript, and they will be compiled to commonjs when the form runner is built.
You will also be able to unit test transforms since forks have the additional tooling to run tests.

1. Write the transforms in `runner/src/server/transforms/summaryDetails/index.ts`. The boilerplate is provided, you only need to update `summaryDetailsTransformations`

   ```ts
   import { SummaryDetailsTransformationMap } from "server/transforms/summaryDetails/types";
   export { SummaryDetailsTransformationMap };

   const summaryDetailsTransformations: SummaryDetailsTransformationMap = {
     "marriage-in-spain": (details: any[]) => {
       //..
     },
   };
   module.exports = summaryDetailsTransformations;
   ```

2. (Optional) Split the transforms across multiple files

   1. create a new file for the transform that should be abstracted, for example `marriage.ts`, and export the transform in the commonjs format:

      ```ts
      // runner/src/server/transforms/summaryDetails/marriage.ts
      import { SummaryDetailsTransformation } from "server/transforms/summaryDetails/types";

      export const marriageTransform: SummaryDetailsTransformation = (
        details
      ) => {
        // modify details
      };
      ```

   2. In the `index.ts` file, import the transform and add it to the `summaryDetailsTransformations` object:

      ```ts
      // runner/src/server/transforms/summaryDetails/index.ts
      import { marriageTransform } from "./marriage";

      import { SummaryDetailsTransformation } from "server/transforms/summaryDetails/types";
      const summaryDetailsTransformations = {
        "marriage-in-spain": marriageTransform,
        "marriage-in-france": marriageTransform,
        feedback: (details) => {},
      };
      ```

3. (Optional) Write unit tests for transforms, create a new file in `runner/src/server/transforms/summaryDetails/__tests__/marriage.jest.ts` and write the tests with Jest.
