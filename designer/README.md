# digital-form-builder-designer

A hapi plugin providing a visual designer for [digital form builder](https://github.com/DEFRA/digital-form-builder) based applications.

### Clone and build

Clone this repo

`$ git clone https://github.com/XGovFormBuilder/digital-form-builder`

`$ cd digital-form-builder/designer/`

Install dependencies

`$ yarn`

To run the server and client apps locally, for development:

`$ yarn dev`

Open your browser at

`https://localhost:3000`

# Environment variables

If there is a .env file present, these will be loaded in first.

To symlink an external .env file, for example inside a [Keybase](https://keybase.io) folder:

`yarn run symlink-env /location/of/.env`.

`symlink-config` accepts two variables, ENV_LOC and LINK_TO. If the file location is not passed in, you will be prompted for a location.
LINK_TO is optional, it defaults to `./${PROJECT_DIR}`.

| name                    | description                                                | required | default        |            valid            |                                                                   notes                                                                   |
| ----------------------- | ---------------------------------------------------------- | :------: | -------------- | :-------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------: |
| NODE_ENV                | Node environment                                           |    no    | development    | development,test,production |                                                                                                                                           |
| PORT                    | Port number                                                |    no    | 3000           |                             |                                                                                                                                           |
| PREVIEW_MODE            | Preview mode                                               |    no    | false          |                             | This should only be used in a dev or testing environment. Setting true will allow POST requests from the designer to add or mutate forms. |
| PREVIEW_URL             | Base URL for links to preview forms in user's web browser  |    no    | localhost:3009 |                             |
| PUBLISH_URL             | Base URL used by designer to POST and GET runner's API     |    no    | localhost:3009 |                             |
| PERSISTENT_BACKEND      | storage backend service                                    |    no    |                |           s3,blob           |                              currently only s3 integration is properly supported. blob (or none) is stubbed.                              |
| PERSISTENT_ACCESS_KEY   | Access key for backend persistence                         |    no    |                |                             |                                                                                                                                           |
| PERSISTENT_KEY_ID       | (Access) key ID for backend persistence                    |    no    |                |                             |                                                                                                                                           |
| S3_BUCKET               | Name of the S3 bucket to upload to                         |    no    |                |                             |                                                                                                                                           |
| LOG_LEVEL               | Log level                                                  |    no    | debug          |   trace,debug,info,error    |                                                                                                                                           |
| FOOTER_TEXT             | Text displayed on the left side of the footer              |    no    |                |                             |
| SESSION_TIMEOUT         | server-side storage expiration time - in milliseconds      |    no    |                |                             |
| SESSION_COOKIE_PASSWORD | at least 32 char long string for session cookie encryption |    no    |                |                             |

## Unit tests

This project currently has a combination of tests written with Hapi helpers and tests written in Testing Library, the aim is to have all component tests written in Testing Library so please aim to do that if you come accorss any Hapi tests.

To watch the tests:

```sh
yarn jest --watch
```

or run this in the root of the project:

```sh
yarn designer jest --watch
```

# Test coverage threshold

Designer has 2 test frameworks, lab from hapi and jest.
Unit test coverage threshold, code coverage below which build will fail is set separately for different frameworks

lab - test threshold is configured using lab's switch -t COVERAGE_THRESHOLD, at the moment it is set as 89, see test-lab-cov script in [package.json](package.json)

jest - test thresholds are configured in [jest.client.config.js](jest.client.config.js) ,[jest.server.config.js](jest.server.config.js), at the moment line coverage thresholds for client and server are 40 and 56 respectively

Note - jest is breaking builds strictly, only for line coverage, other coverage thresholds may not result in a broken build, if the coverage is not met

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
