# ADR-0008: Configurable Button Text via Controller Getter Pattern

**Status:** Accepted  
**Date:** 2025-03-04

## Context

Button text in the page template was controlled by a growing if/elseif chain that required the template to know about controller types. There was also no way to customise button text per page instance without changing code.

## Decision

Replace the template conditional with a `defaultButtonText` getter on `PageControllerBase`. Subclasses override the getter with their own default. An optional `customButtonText` field in the page definition allows per-instance overrides without any code changes.

```njk
{{/* Before */}}
{% if isStartPage %}
  {{ govukButton({ text: "Start now" }) }}
{% elseif page.isMiniSummaryPageController %}
  {{ govukButton({ text: "Confirm and continue" }) }}
{% else %}
  {{ govukButton({ text: "Continue" }) }}
{% endif %}

{{/* After */}}
{{ govukButton({ text: page.buttonText }) }}
```

Resolution order in the base constructor:

```js
this.buttonText = pageDef.customButtonText ?? this.defaultButtonText;
```

## Consequences

- Template no longer needs to know about controller types
- New controllers override the getter only — no template changes needed
- Per-instance text is configurable via form JSON — no code changes needed
- Reduces incentive to create new controllers for minor UI variations
- Fully backwards compatible — existing pages are unaffected

---

# ADR-0008: Subtitle Field on MiniSummaryPageController

**Status:** Accepted  
**Date:** 2025-03-04

## Context

The mini summary page had no way to display contextual text between the page title and the summary list. The only option was to hardcode it in the template. A configurable `subtitle` field was needed.

## Decision

Add `subtitle?: string` to `MiniSummaryPageController` only, not to the shared `PageControllerBase`. The value is read from `pageDef` in the constructor and rendered in `heading.html` when present.

```js
// MiniSummaryPageController constructor
this.subtitle = pageDef.options?.subtitle;
```

```html
{% if page.subtitle %}
<p class="govuk-body">{{ page.subtitle }}</p>
{% endif %}
```

**Why not on the base class?** Most pages set subtitles via a component. Putting it on the base would conflict with that pattern and cause confusion. Keeping it scoped to `MiniSummaryPageController` reflects that this is a workaround specific to a controller that cannot use the standard component approach.

**Why `options` rather than the top-level `pageDef` schema?** This follows the existing convention for passing page-specific variables — properties that aren't communal to all pages go through `options`. The trade-off is that `options` is not schema-validated per page type, which is an acknowledged gap across the codebase (see tech debt note below).

## Consequences

- Subtitle can be configured per page instance via form JSON — no code changes needed
- Scoped to `MiniSummaryPageController` only — no risk of conflicting with subtitle handling on other page types
- Fully backwards compatible — pages without a `subtitle` in their definition are unaffected

**Tech debt:** The `options` object is untyped across the repo, meaning misconfigured properties fail silently at runtime rather than being caught at load time. A follow-up task should define typed `pageDef` interfaces per controller (e.g. a dedicated `pageControllers/types.ts` mirroring the components pattern) and validate them at startup. This is out of scope for this PR.
