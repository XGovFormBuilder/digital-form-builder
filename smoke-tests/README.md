# Smoke Tests

The tests use [webdriverio](https://webdriver.io) and run using the WebDriver Protocol utilising the selenium-standalone
server.

## Assumptions

* You're using either a Linux based OS or MacOSX
* Node.js 12.x LTS and Yarn are installed on your machine

## Pre-requisites

1. You have changed the directory to where the smoke tests are located for the specific component you wish to test i.e.
   for the designer you need to be in the directory `smoke-tests/designer`

2. Then run `yarn install` in the terminal

3. The Chrome browser is installed

## Running the tests

Everything is now setup to run the tests and *Chrome* is used as the default browser. To use a different browser update
the `browserName` located in the `wdio.conf.js` file before executing the tests.

```Javascript
 capabilities: [
  {
    maxInstances: 5,
    browserName: "chrome",
    acceptInsecureCerts: true,
  },
]
  ```

To launch a test run against your local instance (http://localhost:3000) run `yarn smoke-test`
command in the terminal. This will launch several *Chrome* instances up to a maximum of 5 as specified by the number
of `maxInstances` in the config file.

## Running tests in headless mode

To run the tests using Chrome in headless mode run the command `yarn smoke-test-headless`

## Overriding the baseUrl

The default `baseUrl` in the `wdio.conf.js` config file is currently set to *http://localhost:3000*
if you wish to override it to run against a different environment run the following command:

`yarn smoke-test --baseUrl=https://myBaseUrl.com`
