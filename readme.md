# digital-form-builder

This repository is forked from [DEFRA's digital form builder](https://github.com/DEFRA/digital-form-builder).
The supplementary [designer](https://github.com/UKForeignOffice/digital-form-builder-designer) and [engine](https://github.com/UKForeignOffice/digital-form-engine) repositories have also been forked.
These projects has been adapted to run several configurations on a single instance.


> DEFRA's digital form builder is a metadata-driven framework that builds on our robust,
enterprise backend tech stack and the new gov.uk frontend Design System and allows form based gov.uk sites to be easily
built using a graphical design tool.

The designer is no longer a plugin and is responsible for running itself on default port 3000. 

## Getting started

### Prerequisites
- Install Node.js v10.x.x
- For development, secrets have been stored and shared using [Keybase](https://keybase.io). 
  - Once you have access Install [mkcert](https://github.com/FiloSottile/mkcert) which allows us to use locally-trusted certificates ([GOV.UK Pay](https://www.payments.service.gov.uk) will only allow redirects to `https://`)
  - Set `$CAROOT` to `KEYBASE_TEAM_DIR/rootCA.pem` 
  - run `mkcert -install`
  
If you do not have access to the team's Keybase you can create your own certificates following the mkcert documentation.
  

### Clone and build

Clone this repo

`$ git clone https://github.com/CautionYourBlast/digital-form-builder`

`$ cd digital-form-builder/`


Install dependencies

`$ npm i`

You are now ready to start.

`$ npm run dev`


Open your browser at

`https://localhost:3009`


# Environment variables
If there is a .env file present, these will be loaded in first. 

To symlink an external .env file, for example inside a [Keybase](https://keybase.io) folder:

`npm run symlink-env /location/of/.env`.
 
`symlink-config` accepts two variables, ENV_LOC and LINK_TO. If the file location is not passed in, you will be prompted for a location.
 LINK_TO is optional, it defaults to `./${PROJECT_DIR}`.



| name           | description       | required | default |            valid            |             notes             |
|----------------|-------------------|:--------:|---------|:---------------------------:|:-----------------------------:|
| NODE_ENV       | Node environment  |    no    |         | development,test,production |                               |
| PORT           | Port number       |    no    | 3009    |                             |                               |
| OS_KEY         | Ordnance Survey   |    no    |         |                             | For address lookup by postcode|
| PAY_API_KEY    | Pay api key       |    yes   |         |                             |                               |
| PAY_RETURN_URL | Pay return url    |    yes   |         |                             | For GOV.UK Pay to redirect back to our service |
| PAY_API_URL    | Pay api url       |    yes   |         |                             |                               |
| NOTIFY_API_KEY | Notify api key    |    yes   |         |                             |                               |
| MATOMO_URL     | URL of Matomo     |    no    |         |                             |                               |
| MATOMO_ID      | ID of Matomo site |    no    |         |                             |                               |
| SSL_KEY        | SSL Key           |    no    |         |                             |                               |
| SSL_CERT       | SSL Certificate   |    no    |         |                             |                               |
| PREVIEW_MODE   | Preview mode      |    no    | false   |                             | This should only be used in a dev or testing environment. Setting true will allow POST requests from the designer to add or mutate forms. |

# Testing
Tests are found inside `test/cases`. For test scripts, name them `${NAME}.test.js`. 

# Deployment
Currently CI is done with [circleCI](https://circleci.com). Pushes to master
will trigger a build phase which includes running tests and [lighthouse](https://developers.google.com/web/tools/lighthouse)
accessibility audits. Builds will fail if the accessibility score is less than 90%.


# Outputs
At the end of a form, there are multiple output types. The schemas for the right json format can be found in the engine repo.
Additional steps are required for the different output types.
- Notify 
  - A GOV.UK [notify](https://www.notifications.service.gov.uk) is required
  - For each notification you wish to send, a template must be set up. If there are 'personalisations' they must match the configuration
- Sheets
  - This is currently a [Google Sheets](https://docs.google.com/spreadsheets) integration
  - For each sheet you wish to add data to, you must have have the spreadsheet id
  - You must have a Google Cloud Platform (GCP) account 
  - create a project in GCP and note down the project id.
  - enable Google Sheets API for this project
  - Create a [service account](https://developers.google.com/identity/protocols/oauth2/service-account#creatinganaccount) in this project. (You only need to follow the 'Creating a service account' steps on this page) 
    - Once it is created, download the credentials (this will include the private_key and client_email)
- Webhook
  - The webhook must accept a POST request
  - It should also return with a JSON with the key 'reference' in the body
  

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

