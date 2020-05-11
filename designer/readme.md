# digital-form-builder-designer

A hapi plugin providing a visual designer for [digital form builder](https://github.com/DEFRA/digital-form-builder) based applications.

# Environment variables
If there is a .env file present, these will be loaded in first. 

To symlink an external .env file, for example inside a [Keybase](https://keybase.io) folder:

`npm run symlink-env /location/of/.env`.
 
`symlink-config` accepts two variables, ENV_LOC and LINK_TO. If the file location is not passed in, you will be prompted for a location.
 LINK_TO is optional, it defaults to `./${PROJECT_DIR}`.

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
