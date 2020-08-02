# XGov Digital Form Builder
[![Gitter](https://badges.gitter.im/XGovFormBuilder/Public.svg)](https://gitter.im/XGovFormBuilder/Public?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

This repository is a mono repo for
  - [runner](https://github.com/XGovFormBuilder/digital-form-builder/tree/master/runner) - Hapi server which can 'run' a form from a JSON file
  - [engine](https://github.com/XGovFormBuilder/digital-form-builder/tree/master/engine) - Plugin for the above hapi server which serves a schema and the components
  - [designer](https://github.com/XGovFormBuilder/digital-form-builder/tree/master/designer) - A React app to aide in form building

The repos are forked from [DEFRA's digital form builder](https://github.com/DEFRA/digital-form-builder).

## gotchas

### flow
- We're using [flow](https://flow.org) for static type checking. For each of the modules (runner, engine, designer). To prevent issues with unresolved modules, flow-typed is run on postinstall.
- Flag a file to be checked by flow with `// @flow` at the top of the file.
- It's advisable to install the eslint plugin for your text editor, and set the parser to babel-eslint to catch any type errors.
- You can also run `npx flow` or `npx flow status` inside runner/engine/designer to run a type check
  -  you can stop the flow background process with `npx flow stop`

### ci, package managers
 - Our continuous integration is installing dependencies with [yarn](http://yarnpkg.com), so use this if possible. If you prefer to use npm, you will still need to generate a yarn.lock file.

## contributions
Issues and pull requests are welcome. Please check [CONTRIBUTING.md](https://github.com/XGovFormBuilder/digital-form-builder/tree/master/.github/CONTRIBUTING.md) first!



