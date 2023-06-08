This file describes the GitHub Actions workflow in use for the [DLUHC Fork](https://github.com/communitiesuk/digital-form-builder) of the [XGovFormBuilder](https://github.com/XGovFormBuilder/digital-form-builder).

# Versioning

The DLUHC workflow to build and push images uses a manual versioning approach. When merging to main, make sure to update the `VERSION` env var in [dluhc-build-and-publish.yml](https://github.com/communitiesuk/digital-form-builder/blob/fs-1263-publish-fork/.github/workflows/dluhc-build-and-publish.yml)

# Using a new version of the DLUHC fork

## Github build

Any push to any branch will build a docker image of the runner and tag it with the commit ID. See [.github/workflows/dluhc-build-and-publish.yml](#.github/workflows/dluhc-build-and-publish.yml). On main, it will also tag with latest.

So to consume a docker image produced by this workflow, update the `Dockerfile` you are using (probably [this one](./fsd_config/Dockerfile) ) to pull the tag produced by this workflow.

## Local build

To skip the roundtrip of pushing up to github, you can build the docker image for the runner locally and consume in the docker-runner:

    cd digital-form-builder
    docker build -f runner/Dockerfile . -t local-form-runner

Then update the [Dockerfile](./fsd_config/Dockerfile) used by the docker-runner to point to this tag:

    ARG BASE_IMAGE_TAG="latest"
    # FROM ghcr.io/communitiesuk/digital-form-builder-dluhc-runner:$BASE_IMAGE_TAG as base
    FROM local-form-runner:latest as base
    ARG FORMS_DIR="forms-v3"

Then build and run the form-runner through docker compose

    docker compose build form-runner
    docker compose up form-runner

If just updating the forms (no files within the runner itself) you can just do a fresh `docker compose build form-runner`, you don't need to update the Dockerfile or do a `docker build...`

# Workflow Files

## .github/workflows/dluhc-build-and-publish.yml

This is the main workflow file for changes made in the DLUHC fork. On every push to any branch it will:

- Run linting and unit tests against `model`, `runner`, `designer`.
- Run `docker-compose build` for `runner`, `designer`
- Tag both the above images with: `GIT_SHA`, `branch_name`
- If we are on main, also:
  - Tag both images with `latest`
  - Tag the repo with the current version number, as defined by the `VERSION` env var in [this file](https://github.com/communitiesuk/digital-form-builder/blob/fs-1263-publish-fork/.github/workflows/dluhc-build-and-publish.yml).

## .github/workflows/dluhc-build-and-deploy-with-forms.yml

There are 2 docker images involved in creating our deployed image of the form runner.

[Digital Form Builder DLUHC Runner](https://github.com/communitiesuk/digital-form-builder/pkgs/container/digital-form-builder-dluhc-runner)
This is the image created from our fork of the form runner at https://github.com/communitiesuk/digital-form-builder. It is the base image of what is deployed to PaaS (see below) but does not contain our form_jsons.

Every push of our fork creates a new image, tagged with the commit ID. Pushes to main of our fork create a new image tagged with `latest`. The github action trigger ignores pushes to [FSD configuration](./fsd_config/). Pushes of our fork do not automatically redeploy the form runner with our forms - to do this you must manually trigger [Build and Deploy with Forms](./.github/workflows/dluhc-build-and-deploy-with-forms.yml). The form runner base images can be used in fsd_config/Dockerfile to test branch changes.

[Funding Service Design Frontend Runner](https://github.com/communitiesuk/digital-form-builder/pkgs/container/runner)
This is the image we deploy to PaaS. It uses the [Dockerfile](./fsd_config/Dockerfile) to create the image, which takes the `Digital Form Builder DLUHC Runner` image as the base image, and imports the `form_jsons` from this repo over the top to produce our custom form runner image.

This image is built, pushed and deployed by [Build and Deploy Forms](./.github/workflows/dluhc-build-and-deploy-with-forms.yml). That workflow is manually triggered, it does not automatically trigger on an update of the form runner base image.

## .github/workflows/main--lint-unit-build-and-publish-images.yml

**Disabled** This is the workflow used on the main branch of the original XGovFormBuilder repo. It does not apply to our workflow.

## .github/workflows/branch--lint-unit-and-smoke-test.yml

Runs against a branch that has an open pull request against it. It will execute on every push to such a branch to build and run smoke tests. Unchanged from upstream repo.
