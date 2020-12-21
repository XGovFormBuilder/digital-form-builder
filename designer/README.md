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

| name                  | description                                               | required | default        |            valid            |                                                                   notes                                                                   |
| --------------------- | --------------------------------------------------------- | :------: | -------------- | :-------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------: |
| NODE_ENV              | Node environment                                          |    no    | development    | development,test,production |                                                                                                                                           |
| PORT                  | Port number                                               |    no    | 3000           |                             |                                                                                                                                           |
| PREVIEW_MODE          | Preview mode                                              |    no    | false          |                             | This should only be used in a dev or testing environment. Setting true will allow POST requests from the designer to add or mutate forms. |
| PREVIEW_URL           | Base URL for links to preview forms in user's web browser |    no    | localhost:3009 |                             |
| PUBLISH_URL           | Base URL used by designer to POST and GET runner's API    |    no    | localhost:3009 |                             |
| PERSISTENT_BACKEND    | storage backend service                                   |    no    |                |           s3,blob           |                              currently only s3 integration is properly supported. blob (or none) is stubbed.                              |
| PERSISTENT_ACCESS_KEY | Access key for backend persistence                        |    no    |                |                             |                                                                                                                                           |
| PERSISTENT_KEY_ID     | (Access) key ID for backend persistence                   |    no    |                |                             |                                                                                                                                           |
| S3_BUCKET             | Name of the S3 bucket to upload to                        |    no    |                |                             |                                                                                                                                           |
| LOG_LEVEL             | Log level                                                 |    no    | debug          |   trace,debug,info,error    |                                                                                                                                           |

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
