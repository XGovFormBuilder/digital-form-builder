# XGov Digital Form Builder

[![Gitter](https://badges.gitter.im/XGovFormBuilder/Public.svg)](https://gitter.im/XGovFormBuilder/Public?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

This repository is a mono repo for

- @xgovformbuilder/[runner](https://github.com/XGovFormBuilder/digital-form-builder/tree/master/runner) - Hapi server which can 'run' a form from a JSON file
- @xgovformbuilder/[designer](https://github.com/XGovFormBuilder/digital-form-builder/tree/master/designer) - A React app to aide in form building
- @xgovformbuilder/[model](https://github.com/XGovFormBuilder/digital-form-builder/tree/master/model) - Serves the data model and other helpers

The repos are forked from [DEFRA's digital form builder](https://github.com/DEFRA/digital-form-builder).

This is a (getting close to) zero-install yarn 2 workspaces repository. .yarnrc.yml allows us to align our yarn environments. Please commit any plugins in .yarn, but do not commit your .yarn/cache. CI will save and restore the caches.

Workspaces will deal with sym-linking the packages, so we do not have to manually run `yarn link`.
It will also deal with hoisting the node_modules for any packages that are shared between the repos, thus decreasing any install times. Hopefully it all just works™️.

## Setup

**Always run scripts from the root directory.**

1. Make sure you are using node >=12. `node --version`.
2. Make sure you have yarn 2.4+ installed.
3. Run `$ yarn` command to install all dependencies in all workspaces.
4. Run `$ yarn build` to build all workspaces (this is needed because dependencies can depend on each other).

As already mentioned, **always run scripts from the root directory.** because workspaces don't have scripts or packages you need to run from inside their folders and by running in the root directory yarn 2 can resolve the scripts/packages properly.

To learn more about workspaces, check these links:

- [Workspaces in Yarn](https://classic.yarnpkg.com/blog/2017/08/02/introducing-workspaces/)
- [Workspaces](https://classic.yarnpkg.com/en/docs/workspaces)

### I want to...

#### run a specific workspaces' script

`$ yarn [runner|designer|model] name-of-script`

eg.: `yarn designer start` or `yarn runner add babel-core --dev`

#### run a script for each of the workspaces

`$ yarn workspaces foreach run name-of-script`

#### watch and build for changes across all repos

I wouldn't recommend it unless you have a beefy processor.

`$ yarn watch`

#### add a dependency to all workspaces

`$ yarn add packagename`

#### create a new workspace

1. create a new directory for the workspace and yarn init it
   1. `$ mkdir myNewLib`
   2. `$ cd myNewlib`
   3. `$ yarn init`
2. in the root `package.json`
   1. add `myNewLib` to the `workspaces` object.

## Troubleshooting

If you have any problems, submit an issue or send a message via gitter.

### Error: ENOENT: no such file or directory, scandir 'xxx/node_modules/node-sass/vendor'

`/vendor` is not present since it hasn't been built or rebuilt. You may also get this issue with `core-js`, `fsevents`, `nodemailer` etc.
`$ yarn rebuild` to rebuild all the packages
`$ yarn rebuild only node-sass` to rebuild just node-sass

### CI

#### Build process

1. Pushes to any branch will start the build process
2. `.circleci/circle_trigger.sh` will check for any changes in our packages, and if builds have failed previously
3. `circle_trigger.sh` will trigger a workflow via the API. It will pass the parameters model, runner, designer (bool) to the workflow.
4. If there are any changes to a workspace, it will be built and tested.

- If an upstream dependency, like model has changed, the downstream dependencies (runner, designer) will also be built and tested.

#### Development environment

The development workflow is triggered whenever a PR is merged into master and you can monitor it on the repository's [action tab](https://github.com/XGovFormBuilder/digital-form-builder/actions).

The workflow contains two separate jobs that run in parallel, one for the Runner and another for the Designer application.

Both jobs work as follows:

1. Build the docker image with all dependencies.
2. Push image to Heroku Container Registry.
3. Release the latest image.

The latest releases will be running here: [Runner](https://digital-form-builder-runner.herokuapp.com) / [Designer](https://digital-form-builder-designer.herokuapp.com).

## contributions

Issues and pull requests are welcome. Please check [CONTRIBUTING.md](./CONTRIBUTING.md) first!

## Known Issues

The following are known issues and may affect your use of Digital Forms Builder. These issues will be prioritised and any updates will be captured within the issue itself.

### In progress

* FORMS-324	[Tech Debt - Designer - Acceptance Tests	Story](https://github.com/XGovFormBuilder/digital-form-builder/issues/334)
* FORMS-319	[Designer tech debt - defining sub-components in lists](https://github.com/XGovFormBuilder/digital-form-builder/issues/335)

### Coming soon

* FORMS-318 [Improve workspaces folder structure](https://github.com/XGovFormBuilder/digital-form-builder/issues/161)
* FORMS-323 [rewrite class components as function components](https://github.com/XGovFormBuilder/digital-form-builder/issues/173)
* FORMS-317	[Adjust app dependencies](https://github.com/XGovFormBuilder/digital-form-builder/issues/333)	

### Backlog 

 * [Schema validation fails](https://github.com/XGovFormBuilder/digital-form-builder/issues/293)
 * [Missing features from prototyping FCDO emergency travel alerts](https://github.com/XGovFormBuilder/digital-form-builder/issues/291)
 * [Bugs / UX issues / missing features from prototyping FCDO emergency alerts](https://github.com/XGovFormBuilder/digital-form-builder/issues/290)
 * [Deploy PRs to a preview environment for signoff / QA](https://github.com/XGovFormBuilder/digital-form-builder/issues/240)
 * [Home Office specific templates in designer](https://github.com/XGovFormBuilder/digital-form-builder/issues/212)
 * [Refactor @model/AbstractConditionValue to interface](https://github.com/XGovFormBuilder/digital-form-builder/issues/180)
 * [Change visit url param to cookie](https://github.com/XGovFormBuilder/digital-form-builder/issues/152)
 * [Review CI Test Signal](https://github.com/XGovFormBuilder/digital-form-builder/issues/144)
 * [Refactor Data model class usage to use hooks](https://github.com/XGovFormBuilder/digital-form-builder/issues/143)
 * [Use govuk-react-jsx components](https://github.com/XGovFormBuilder/digital-form-builder/issues/139)
 * [UploadService behaviour](https://github.com/XGovFormBuilder/digital-form-builder/issues/130)
 * [Manual accessibility ](https://github.com/XGovFormBuilder/digital-form-builder/issues/129)
 * [Run lighthouse against ](https://github.com/XGovFormBuilder/digital-form-builder/issues/126)
 * [Add a11y](https://github.com/XGovFormBuilder/digital-form-builder/issues/125)
 * [Creating an inline condition on a link does not assign it to the link](https://github.com/XGovFormBuilder/digital-form-builder/issues/110)
 * [Conditions not redirecting to correct next page](https://github.com/XGovFormBuilder/digital-form-builder/issues/109)
 * [Documentation](https://github.com/XGovFormBuilder/digital-form-builder/issues/86)
 * [Test old components](https://github.com/XGovFormBuilder/digital-form-builder/issues/80)
 * [repeatable pages (unspecified n)](https://github.com/XGovFormBuilder/digital-form-builder/issues/75)
 * [Add gitter hook to circleci config ](https://github.com/XGovFormBuilder/digital-form-builder/issues/60)
 * [Provide components to support URL and National Insurance capture](https://github.com/XGovFormBuilder/digital-form-builder/issues/59)
 * [(Optional) text does not appear for optional fields which are shown when a list item is selected](https://github.com/XGovFormBuilder/digital-form-builder/issues/31)
 * [Re-ordering of list items doesn't work](https://github.com/XGovFormBuilder/digital-form-builder/issues/25)
 * ["reactify" forms](https://github.com/XGovFormBuilder/digital-form-builder/issues/18)


### Developer only features ⚠️

There are some features that we do not want to expose (for fear of wide adoption), as they are not complete or have accessibility issues. Please use these with caution. 

- Conditionally revealing of fields based on checkbox/radio selection. 
  - This is a known accessibility issue. https://github.com/alphagov/govuk-frontend/issues/1991. NVDA, JAWS and VoiceOver (currently most popular screen readers) all have varying levels of support for checkboxes and radios. It is breaking WCAG 2.1A compliance.
  - If you would like to use these, the runner will still support child components, you must add this to your JSON configuration manually. 
    - Static lists (inside a Radios/Checkboxes Field component) 
      ``` json5
      { // Component object, other keys stripped for brevity
        ...
        "type": "RadiosField",
        "values": {
          "type": "static",
          "valueType": "string",
          "items": [
            { "label": "Item 3", "value": "13", "children": [{ ...subcomponent }] }
          ]
        }
      }
      ```
      where `{ ...subcomponent }` is any valid `Component` object
    - Global lists
      ``` json5 
      { //List object, other keys stripped for brevity
        ...
        "items": [
          { "text": "a", "value": "a", "description": "a",
            "conditional": {
              "components":[{ ...component }]
            }
          }
        ]
      }
      ```
      where `{ ...subcomponent }` is any valid `Component` object



