> [!NOTE]
> This template is designed to help both contributors and maintainers. It is a checklist to ensure all necessary
> information is provided, and prompts contributors on any contribution guidelines they have missed.
>
> Do not remove sections.
> They are important for the review process and help maintainers ensure quality and good documentation across the
> project.
>
> Some checkboxes will not apply to every change, so feel free to leave them unchecked if they are not relevant.

# Description

## Context

<!--
Include these details if applicable:
- A summary of the change
- A link to the issue this change addresses
- Motivation and context for the change
- Acceptance criteria if you have any
- A screen recording or screenshots of the feature or change
-->

TODO..

## Changes

- Change A
- Change B

## Type of change

What is the type of change you are making?

- [ ] Chore or documentation (non-breaking change that does not add functionality)
- [ ] ADR (Architectural Decision Record, non-breaking change that documents or proposes a decision)
- [ ] Refactor (non-breaking change that improves code quality)
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)

### PR title

PR titles should be prefixed with the type of change you are making, based on the [README.md#versioning](https://github.com/XGovFormBuilder/digital-form-builder?tab=readme-ov-file#versioning).
This is so that when performing a squash merge, the PR title is automatically used as the commit message.

Have you updated the PR title to match the type of change you are making?

- [ ] Yes
- [ ] No, I need help or guidance

# Testing

<!--
Several departments use XGovFormBuilder in production.
Automated tests help ensure that changes do not break existing functionality for another department.

Maintainers are sympathetic to the time constraints of government departments, but please try to be good citizens and add tests when possible.
-->

## Automated tests

Have you added automated tests?

- [ ] Yes, unit or integration tests
- [ ] Yes, end-to-end (cypress) tests
- [ ] No, tests are not required for this change
- [ ] No, I need help or guidance
- [ ] No (explain why tests are not required or can't be added at this time)

## Manual tests

Have you manually tested your changes?

- [ ] Yes
- [ ] No, manual tests are not required or sufficiently covered by automated tests

Have you attached an example form JSON or snippet for the reviewer in this PR?

- [ ] Yes
- [ ] No, any existing form can be used
- [ ] No, it is not required or not applicable

### Steps to test

<!--
Only fill out this section if you answered "Yes" to manually testing your changes.

In this section
- describe the tests that you ran to verify your changes
- provide instructions and a form JSON or snippet so we can reproduce the test if necessary

If uploading a form JSON, use the "attach files" feature in GitHub PR.
-->

1. Step 1
2. Step 2

# Documentation

Have you updated the documentation?

- [ ] Yes, I have updated [./docs](https://github.com/XGovFormBuilder/digital-form-builder/tree/main/docs) for this change since additional explanation or steps to use/configure the feature is required
- [ ] Yes, I have added or updated an [ADR](https://github.com/XGovFormBuilder/digital-form-builder/tree/main/docs/adr) for this change since it is large, complex, or has significant architectural implications
- [ ] Yes, I have added inline comments for hard-to-understand areas
- [ ] No, I am not sure if documentation is required
- [ ] No, documentation is not required for this change

# Discussion

> [!WARNING]
>
> Large or complex changes may require discussion with the maintainers before they can be merged. If it has not yet been discussed, it may delay the review process

Have you discussed this change with the maintainers?

- [ ] Yes, I have discussed this change with the maintainers on slack, email or via GitHub issues
- [ ] Yes, this change is an ADR to help kick-off discussion
- [ ] No, this change is small and does not require discussion
- [ ] No, I am not sure if one is required
