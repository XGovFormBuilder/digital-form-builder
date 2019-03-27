# digital-form-builder

DEFRA's digital form builder is a metadata-driven framework that builds on our robust, enterprise backend tech stack and the new gov.uk frontend Design System and allows form based gov.uk sites to be easily built using a graphical design tool.

The framework is flexible. It is capable of handling a number of different scenarios where form based page are required. E.g. Collecting data in a transactional service or checking if a service is suitable for an end user.

Using the graphical design tool, users can build sites from a toolkit of common GDS patterns that includes Pages, Sections and Navigation elements along with Components like Text Fields, Radios Buttons, Checkboxes and Date Fields.

## Live Playground
You can use `digital-form-builder` in your browser without having to install anything by using the online playground.

Click [here](https://digital-form-builder.herokuapp.com/designer) for the designer, [here](https://digital-form-builder.herokuapp.com) for the running application or for a split screen view of both, click [here](https://digital-form-builder.herokuapp.com/split).

The default playground application is an extended version of the [Check a service is suitable](https://design-system.service.gov.uk/patterns/check-a-service-is-suitable/) example pattern from the [GOV.UK Design System](https://design-system.service.gov.uk/). Feel free to change it though and explore the features of the form builder. You can even download and upload your json files so you don't lose your changes.

## Getting started

### Prerequisites
Install Node.js v8.x.x

Install `npm i -g browser-refresh` (optional). 
This is like `nodemon` and restarts the server when files change.
Additionally it reloads the browser page is useful during development.

### Clone and build

Clone this repo

`$ git clone https://github.com/DEFRA/digital-form-builder`

`$ cd digital-form-builder/`


Install dependencies

`$ npm i`

You are now ready to start.

`$ browser-refresh`


Open your browser at

`http://localhost:3009/split`


# Environment variables

| name     | description      | required | default |            valid            |             notes             |
|----------|------------------|:--------:|---------|:---------------------------:|:-----------------------------:|
| NODE_ENV | Node environment |    no    |         | development,test,production |                               |
| PORT     | Port number      |    no    | 3009    |                             |                               |
| OS_KEY   | Ordnance Survey  |    no    |         |                             | For address lookup by postcode|

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.