# Maintainers Guide

This document is for people with maintainer permissions on
XGovFormBuilder/digital-form-builder.

Maintainers are responsible for:

- Protecting the long-term vision of the project
- Keeping the designer and runner aligned
- Enforcing quality: tests, style, accessibility, docs
- Being good stewards of the community (see CODE_OF_CONDUCT.md)

If you’re not a maintainer, see CONTRIBUTING.md instead.

## Vision and scope

**Vision**

XGov Digital Form Builder exists to let anyone quickly design and deploy
high-quality, GOV.UK-style forms.

We do this via two main pieces:

- **Designer** – a UI for building forms through a simple, low-code interface
- **Runner** – an app that serves and runs those forms for end users

**As a maintainer, you agree to:**

1. **Keep designer and runner in sync**

   - Any change to the form model, components or behaviour that affects one
     SHOULD be reflected in the other.
   - Prefer changes that improve both designer and runner rather than
     introducing “designer-only” or “runner-only” concepts.
   - If you must diverge temporarily, open an issue to track re-alignment and
     reference it in the PR.

2. **Stay within scope**

   - We focus on **GOV.UK-style** digital forms and journeys.
   - Avoid adding features that:
     - conflict with GOV.UK Design System and Service Standard, or
     - turn the project into a generic “do everything” app builder.
   - When in doubt about scope, open a discussion/ADR rather than merging.

## Quality expectations

Maintainers are the last line of defence for quality. Before you merge, you
are responsible for ensuring:

### Tests

- New features come with appropriate **unit tests** and, where relevant,
  **integration/e2e tests**.
- CI must be green. Do not merge on red or “flaky but probably fine” runs.
- When fixing a bug, add at least one test that fails before the fix
  and passes after.

### Style & consistency

- Code must follow the project’s eslint/prettier/tsconfig setup.
- Prefer existing patterns over new ones:
  - Use established component and model patterns before inventing new abstractions.
  - Keep naming consistent with existing code (e.g. same terminology in designer,
    runner and docs).

### Accessibility & UX

- Changes to UI must consider accessibility:
  - Use GOV.UK Design System components and patterns wherever possible.
  - Ensure labels, error messages and focus states are correct.
- Try the change in both **designer** and **runner** and sanity-check the
  user journey.

### Documentation

- Significant behaviour or model changes must be documented:
  - Update relevant README/feature docs/ADRs.
  - Note breaking changes clearly in the changelog / release notes
    (see versioning rules).

## Maintainer workflow

### Branching and merging

- Use pull requests for all changes (no direct commits to `main`).
- Use the existing commit prefixes for SemVer:
  - `breaking:` / `major:`
  - `feature:` / `minor:`
  - `fix:` / `patch:`
- Never bypass review on your own non-trivial PRs:
  - At least **one other maintainer** should approve, unless:
    - change is trivial (docs/typo) AND
    - no behaviour or API changes.

### Reviews

When reviewing PRs, maintainers should:

1. **Check alignment with vision**

   - Does this help people build GOV.UK-style forms more easily?
   - Does it keep designer and runner aligned?

2. **Check quality**

   - Tests added/updated?
   - CI green?
   - Code follows existing patterns?

3. **Be constructive**
   - Prefer "how can we get this over the line?" to "no".
   - Suggest concrete changes when requesting changes.

### Security & compliance

- Treat secrets, keys and environment variables with care.
- Do not commit secrets. If a leak happens, rotate and document the incident.
- Follow GOV.UK and general security best practices (input validation, output
  encoding, etc.).

## Architecture decisions

- Non-trivial changes to architecture, data model or external interfaces
  (e.g. how forms are stored/run) SHOULD have an Architecture Decision Record (ADR).
- ADRs should:
  - explain the problem,
  - list options considered,
  - record the decision and rationale.

Maintainers are responsible for keeping ADRs up to date when behaviour diverges
from what’s written.
