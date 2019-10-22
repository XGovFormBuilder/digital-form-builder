# digital-form-builder

This repository is forked from [DEFRA's digital form builder](https://github.com/DEFRA/digital-form-builder).
The supplementary [designer](https://github.com/CautionYourBlast/digital-form-designer) and [engine](https://github.com/CautionYourBlast/digital-form-engine) repositories have also been forked.
These projects has been adapted to run several configurations on a single instance.


> DEFRA's digital form builder is a metadata-driven framework that builds on our robust,
enterprise backend tech stack and the new gov.uk frontend Design System and allows form based gov.uk sites to be easily
built using a graphical design tool.



## Getting started

### Prerequisites
- Install Node.js v10.x.x
- Secrets are stored in the team Keybase. You must have access for the dev environment
  - Once you have access, Install [mkcert](https://github.com/FiloSottile/mkcert) which allows us to use locally-trusted certificates ([GOV.UK Pay](https://www.payments.service.gov.uk) will only allow redirects to `https://`)
  - Set `$CAROOT` to `KEYBASE_TEAM_DIR/rootCA.pem` 
  - run `mkcert -install`
  

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
These are loaded from the .env file inside of the keybase team folder.


| name           | description      | required | default |            valid            |             notes             |
|----------------|------------------|:--------:|---------|:---------------------------:|:-----------------------------:|
| NODE_ENV       | Node environment |    no    |         | development,test,production |                               |
| PORT           | Port number      |    no    | 3009    |                             |                               |
| OS_KEY         | Ordnance Survey  |    no    |         |                             | For address lookup by postcode|
| PAY_API_KEY    | Pay api key      |    yes   |         |                             |                               |
| PAY_RETURN_URL | Pay return url   |    yes   |         |                             | For GOV.UK Pay to redirect back to our service |
| PAY_API_URL    | Pay api url      |    yes   |         |                             |                               |

# Testing
Tests are found inside `test/cases`. For test scripts, name them `${NAME}.test.js`. 

# Deployment
Currently CI and deployment is done with [circleCI](https://circleci.com) and [Heroku](https://heroku.com). Pushes to master
will trigger a build phase which includes running tests and [lighthouse](https://developers.google.com/web/tools/lighthouse)
accessibility audits. Builds will fail if the accessibility score is less than 90%. 

After a successful build, the project is deployed on [https://fco-forms.herokuapp.com](https://fco-forms.herokuapp.com)


## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

