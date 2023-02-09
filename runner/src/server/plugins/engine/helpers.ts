import { RelativeUrl } from "./feedback";
import { HapiRequest, HapiResponseToolkit } from "server/types";

export const feedbackReturnInfoKey = "f_t";

const paramsToCopy = [feedbackReturnInfoKey];

export function proceed(
  request: HapiRequest,
  h: HapiResponseToolkit,
  nextUrl: string
) {
  const returnUrl = request.query.returnUrl;

  if (typeof returnUrl === "string" && returnUrl.startsWith("/")) {
    return h.redirect(returnUrl);
  } else {
    return redirectTo(request, h, nextUrl);
  }
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
  if (request.query.form_session_identifier) {
    params.form_session_identifier = request.query.form_session_identifier;
  }
  const url = redirectUrl(request, targetUrl, params);
  return h.redirect(url);
}

export const idFromFilename = (filename: string) => {
  return filename.replace(/govsite\.|\.json|/gi, "");
};
