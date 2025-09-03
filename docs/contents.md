# Documentation

Here you can find additional documentation for XGovFormBuilder.

> [!NOTE]
> This is not an exhaustive list. If something is missing, please open an issue or a pull request to add it.

## Contents

- [Runner](#runner)
- [Designer](#designer)
- [Examples](#examples)
- [ADRs](#adrs)

### Runner

Features and configuration options for the runner.

- [Document upload](runner/document-upload.md)
  - Upload documents in the runner
- [Fee options](runner/fee-options.md)
  - Configure API keys for GOV.UK Pay, and the behaviour of retrying payments
- [Save and exit](runner/exit.md)
  - Allow users to exit a form and return later
- [session initialisation](runner/session-initialisation.md)
- Insert sessions into the runner and activate them
- [multi start page](runner/multi-start-page.md)
  - Simulate guidance pages in the runner. This allows pages to be connected with "next" and "previous" buttons such
    as on the [renew or replace your adult passport pages](https://www.gov.uk/renew-adult-passport/renew)
- [redirects](runner/redirects.md)
  - Redirect users to a different page in the runner or external URL
- [queues](runner/submission-queue.md)
  - Submit data to a queue after the user has completed the form
- [summary details transforms](runner/summary-details-transforms.md)
  - Modify the details on summary pages before they are displayed to the user
- [templating](runner/templating.md)
  - Allow njks templating within html components and add previous answers to the render context

### Designer

- [Query parameter prepopulation](designer/query-parameter-prepopulation.md)
  - How to prepopulate fields in the designer using query parameters

### Examples

Examples can be found in the [examples repository](https://github.com/XGovFormBuilder/form-builder-examples).

### ADRs

ADRs can be submitted and merged without a feature branch. They will remain in the proposed state until a corresponding
feature branch is merged.

- [template.md](adr/template.md)
  - Template for creating new ADRs
- [0000 state of the union.md](adr/0000-state-of-the-union.md)
  - ADR to store decisions made before 26-03-2021
- [0001 DataModel to functions](adr/0001-data-model-to-functions.md)
- [0002 save and return](adr/0002-save-and-return.md)
- [0003 submitter](adr/0003-submitter.md)
- [0004 submitter](adr/0004-submitter.md)
- [0005 runner pulls from source](adr/0005-runner-pulls-from-source.md)
- [0006 atomic saves](adr/0006-atomic-saves.md)
- [0007 mid-journey save and return](adr/0007-mid-journey-save-return.md)
