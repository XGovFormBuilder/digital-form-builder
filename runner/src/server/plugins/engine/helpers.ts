import { RelativeUrl } from "./feedback";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import { reach } from "@hapi/hoek";
import _ from "lodash";
import { FormSubmissionErrors } from "./types";

export const feedbackReturnInfoKey = "f_t";

const paramsToCopy = [feedbackReturnInfoKey, "returnUrl"];

/**
 * Normalizes a URL path by removing leading and trailing slashes and preserving the query string.
 * @param url The URL path to normalize, which may include a query string.
 * @returns a normalized URL path with leading slash and query string intact.
 */
export function normalizeUrlPath(url: string): string {
  const queryIndex = url.indexOf("?");
  const pathname = queryIndex === -1 ? url : url.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : url.slice(queryIndex);
  const normalizedPathname = pathname.replace(/^\/+|\/+$/g, "");

  return `/${normalizedPathname}${query}`;
}

/**
 * Checks if the url is internal
 */
const isSafeInternalUrl = (url: string): boolean =>
  url.startsWith("/") && !url.startsWith("//");

export function proceed(
  request: HapiRequest,
  h: HapiResponseToolkit,
  nextUrl: string,
  honourReturnUrl: boolean = true
) {
  const returnUrl = request.query.returnUrl;

  if (
    honourReturnUrl &&
    typeof returnUrl === "string" &&
    isSafeInternalUrl(returnUrl)
  ) {
    return h.redirect(returnUrl);
  } else {
    return redirectTo(request, h, nextUrl);
  }
}

/**
 * A page reached via a summary page's "Change" link carries a `returnUrl`
 * query param that already tells us where the user came from - trust it for
 * the back link the same way `proceed` trusts it for forward navigation,
 * rather than relying on the generic progress history.
 */
export function getBackLink(
  request: HapiRequest,
  progress: string[],
  backLinkFallback?: string
) {
  const returnUrl = request.query.returnUrl;

  if (typeof returnUrl === "string" && isSafeInternalUrl(returnUrl)) {
    return returnUrl;
  }

  if (!request.path) {
    return progress[progress.length - 2] ?? backLinkFallback;
  }

  const currentPath = normalizeUrlPath(`${request.path}${request.url.search}`);
  const normalizedProgress = progress.map(normalizeUrlPath);
  const lastProgressEntry = normalizedProgress[normalizedProgress.length - 1];
  const currentPageIsTracked = currentPath === lastProgressEntry;

  return (
    (currentPageIsTracked
      ? normalizedProgress[normalizedProgress.length - 2]
      : lastProgressEntry) ?? backLinkFallback
  );
}

/**
 * Returns the current request's `returnUrl` query param if it's present.
 */
export function getReturnUrl(request: HapiRequest): string | undefined {
  const returnUrl = request.query.returnUrl;

  return typeof returnUrl === "string" && isSafeInternalUrl(returnUrl)
    ? returnUrl
    : undefined;
}

type Params = { num?: number; returnUrl: string } | {};

export function nonRelativeRedirectUrl(
  request: HapiRequest,
  targetUrl: string,
  params: Params = {}
) {
  const url = new URL(targetUrl);

  Object.entries(params).forEach(([name, value]) => {
    url.searchParams.append(name, `${value}`);
  });

  paramsToCopy.forEach((key) => {
    const value = request.query[key];
    if (typeof value === "string") {
      url.searchParams.append(key, value);
    }
  });

  return url.toString();
}

export function redirectUrl(
  request: HapiRequest,
  targetUrl: string,
  params: Params = {}
) {
  const relativeUrl = new RelativeUrl(targetUrl);
  Object.entries(params).forEach(([name, value]) => {
    relativeUrl.setParam(name, `${value}`);
  });

  paramsToCopy.forEach((key) => {
    const value = request.query[key];
    if (typeof value === "string" && !relativeUrl.getParam(key)) {
      relativeUrl.setParam(key, value);
    }
  });

  return relativeUrl.toString();
}

export function redirectTo(
  request: HapiRequest,
  h: HapiResponseToolkit,
  targetUrl: string,
  params = {}
) {
  if (targetUrl.startsWith("http")) {
    return h.redirect(targetUrl);
  }

  const url = redirectUrl(request, targetUrl, params);
  return h.redirect(url);
}

export const idFromFilename = (filename: string) => {
  return filename.replace(/govsite\.|\.jsonc?|/gi, "");
};

export function getValidStateFromQueryParameters(
  prePopFields: Record<string, any>,
  queryParameters: Record<string, string>,
  state: Record<string, any> = {}
) {
  return Object.entries(queryParameters).reduce<Record<string, any>>(
    (acc, [key, value]) => {
      const prePopField = reach(prePopFields, key);
      const stateValue = reach(state, key);
      if (
        !prePopField ||
        (stateValue && !prePopField.allowPrePopulationOverwrite)
      ) {
        return acc;
      }

      const result = prePopField.schema.validate(value);
      if (result.error) {
        return acc;
      }
      _.set(acc, key, value);
      return acc;
    },
    {}
  );
}

/**
 * Link the errors to their first child field to allow scrolling to the error but still display error on fieldset
 * @param errors Form submission errors
 * @param fieldsetFields Fieldset components on page
 */
export function handleFieldsetErrors(
  errors: FormSubmissionErrors,
  fieldsetFields
) {
  for (const fieldset of fieldsetFields) {
    const firstChild = fieldset.children?.items?.[0];
    if (firstChild) {
      for (const err of errors.errorList) {
        if (err.name === fieldset.name) {
          err.path = firstChild.name;
          err.href = `#${firstChild.name}`;
        }
      }
    }
  }
}
