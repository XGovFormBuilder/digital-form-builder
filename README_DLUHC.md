This file describes the GitHub Actions workflow in use for the [DLUHC Fork](https://github.com/communitiesuk/digital-form-builder) of the [XGovFormBuilder](https://github.com/XGovFormBuilder/digital-form-builder).

# Versioning

The DLUHC workflow to build and push images uses a manual versioning approach. When merging to main, make sure to update the `VERSION` env var in [dluhc-build-and-publish.yml](https://github.com/communitiesuk/digital-form-builder/blob/fs-1263-publish-fork/.github/workflows/dluhc-build-and-publish.yml)

# Using a new version of the DLUHC fork

Any push to any branch will build a docker image of the runner and tag it with the commit ID. See [.github/workflows/dluhc-build-and-publish.yml](#.github/workflows/dluhc-build-and-publish.yml). On main, it will also tag with latest.

So to consume a docker image produced by this workflow, update the `Dockerfile` you are using to pull the tag produced by this workflow.

# Workflow Files

## .github/workflows/dluhc-build-and-publish.yml

This is the main workflow file for changes made in the DLUHC fork. On every push to any branch it will:

- Run linting and unit tests against `model`, `runner`, `designer`.
- Run `docker-compose build` for `runner`, `designer`
- Tag both the above images with: `GIT_SHA`, `branch_name`
- If we are on main, also:
  - Tag both images with `latest`
  - Tag the repo with the current version number, as defined by the `VERSION` env var in [this file](https://github.com/communitiesuk/digital-form-builder/blob/fs-1263-publish-fork/.github/workflows/dluhc-build-and-publish.yml).

## .github/workflows/main--lint-unit-build-and-publish-images.yml

**Disabled** This is the workflow used on the main branch of the original XGovFormBuilder repo. It does not apply to our workflow.

## .github/workflows/branch--lint-unit-and-smoke-test.yml

Runs against a branch that has an open pull request against it. It will execute on every push to such a branch to build and run smoke tests. Unchanged from upstream repo.
