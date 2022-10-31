import { RelativeUrl } from "./feedback";
import { HapiRequest, HapiResponseToolkit } from "server/types";

export const feedbackReturnInfoKey = "f_t";

const paramsToCopy = [feedbackReturnInfoKey];

/**
 * TODO: needs refactor. excessively complex code when following `PageControllerBase.proceed`
 */
export function proceed(
  request: HapiRequest,
  h: HapiResponseToolkit,
  nextUrl: string
) {
  const returnUrl = request.query.returnUrl;

  if (typeof returnUrl === "string" && returnUrl.startsWith("/")) {
    return h.redirect(returnUrl);
  }

  const { id } = request.params;
  if (!nextUrl.includes(id)) {
    const segments = nextUrl.split("/");
    const fixedPath = `/${id}/${segments[segments.length - 1]}`;
    return redirectTo(request, h, fixedPath);
  }

  return redirectTo(request, h, nextUrl);
}

type Params = { num?: number; returnUrl: string } | {};

/**
 * TODO: refactor to use URLSearchParams. Object.entries(..) and copying is excessively complex.
 */
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

/**
 * TODO: needs refactor. excessively complex code when following `PageControllerBase.proceed`
 */
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

/**
 * TODO: needs refactor. excessively complex code when following `PageControllerBase.proceed`
 */
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
  return filename.replace(/govsite\.|\.json|/gi, "");
};
