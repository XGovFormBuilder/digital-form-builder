# E2E tests

## Tooling

As much as possible, try to stick to these libraries' principles. It means less documentation to write, and you will be able to find help from their documentation or community.

### Cypress
[Cypress](https://cypress.io) is e2e testing tooling, which by default "awaits" on selectors. It runs the tests by loading them into a chromium browser. 

A problem with smoke tests generally, is that they are reported as "flakey". Test flakeyness has been attributed to elements not loading in quickly enough, or littering the code with awaits. To resolve these issues, you would usually have to rerun the test and cross your fingers. 
The smoke tests  previously ran on wdio's engine (selenium/java based..), however their API was written with parts of the node <16 API which has since been deprecated. Selenium is useful for crossbrowser testing, however we compile to ES5, and the citizen facing runner uses the GDS design system components, which have been crossbrowser tested by the GDS team. 

### Testing library
[Testing library](https://testing-library.com) is "Simple and complete testing utilities that encourage good testing practices". We use the react based library for the designer too. Testing library has a range of selectors based around accessible roles. It discourages you from using css selectors (i.e. based on class or id), which can contribute to flakiness. It encourages you to move away from testing implementation details (which should be reserved for mainly unit tests). 

Write the tests how a user would use your software, instead of adding watchers, spies, mocks etc. 

Please have a read of the [guiding principles](https://testing-library.com/docs/guiding-principles). 

### Cucumber/Gherkin
[Cucumber](https://cucumber.io) helps you write BDD tests (Given, When, Then). It also makes it easier for non-developers to write tests or acceptance criteria.

Currently we do not follow their principles perfectly due to time constraints. Feature files currently resemble a set of instructions to ensure the features work.  

#### Cypress + Cucumber
We use [@badeball/cypress-cucumber-preprocessor](https://www.npmjs.com/package/@badeball/cypress-cucumber-preprocessor). 
This package recently has changed hands, so documentation is also moving around. Here is [@badeball's documentation](https://github.com/badeball/cypress-cucumber-preprocessor/blob/HEAD/docs/readme.md).
Older documentation can be found here [https://www.npmjs.com/package/@badeball/cypress-cucumber-preprocessor](https://www.npmjs.com/package/@badeball/cypress-cucumber-preprocessor)

## Running the tests
As usual, always run commands in the root directory, not in the workspace directory.

1. Install the dependencies `yarn e2e install`
2. Ensure the runner and designer are running. It can be running locally or pointed at a URL.
  - The defaults are set in cypress.config.js. `DESIGNER_URL: http://localhost:3000` and `RUNNER_URL: http://localhost:3009`. You may change this via environment variables by prepending the variable name with cypress_, e.g. `cypress_designer_url=https://..`
3. Run, from the root directory
  - in headless mode `yarn e2e cypress run`
  - in interactive mode `yarn e2e cypress open` (this will open your browser)

### Writing tests
Feature files are written with [gherkin syntax](https://cucumber.io/docs/gherkin/reference/). You may find the cypress-cucumber-preprocessor documentation more useful when trying to find "how to do X in cypress with gherkin/cucumber".

#### Organisation

```
e2e
├── README.md
├── cypress
│   ├── e2e 
│   │   ├── designer # Designer specific tests 
│   │   ├── featureName.feature 
│   │   ├── featureName.js
│   │   └── runner # Runner specific tests
│   ├── plugins
│   ├── screenshots
│   ├── support
│   │   ├── commands.js
│   │   ├── e2e.js
│   │   └── step_definitions # Shared or common steps
│   └── videos
├── cypress.config.js
├── node_modules
└── package.json
```

- Steps that can be used across many features, put in e2e/cypress/support/step_definitions
- Ideally put one step per file. It makes it easier to read and scan for which tests already exist.
  - The filename should be the step name in snake case. For example `When("I am viewing the runner at {string}", (..))`'s filename will be `i_am_viewing_the_runner_at_string.js`.
  - If they are runner or designer specific, please put them in the appropriate directory.
- If the steps are specific to the feature, you may put them next to the feature files.
  - For example `e2e/designer/accessibilityStatement.feature`
  - You can put the specific tests at `e2e/designer/accessibilityStatement.js`
  - OR you can put them at `e2e/designer/accessibilityStatement/*.js`, if you need to split out the steps further. 
  - More documentation on this can be found at [https://github.com/badeball/cypress-cucumber-preprocessor/blob/master/docs/step-definitions.md](https://github.com/badeball/cypress-cucumber-preprocessor/blob/master/docs/step-definitions.md)
  
