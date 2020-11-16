import { RelativeUrl } from "./feedback";
import { HapiRequest, HapiResponseToolkit } from "server/types";

const paramsToCopy = [
  RelativeUrl.FEEDBACK_RETURN_INFO_PARAMETER,
  RelativeUrl.VISIT_IDENTIFIER_PARAMETER,
];

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

export function redirectUrl(
  request: HapiRequest,
  targetUrl: string,
  params: { [name: string]: string | number } = {}
) {
  const relativeUrl = new RelativeUrl(targetUrl);
  Object.entries(params).forEach(([name, value]) => {
    relativeUrl.setParam(name, `${value}`);
  });

  paramsToCopy.forEach((key) => {
    const value = request.query[key];
    if (typeof value === "string") {
      relativeUrl.addParamIfNotPresent(key, value);
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
  return filename.replace(/govsite\.|\.json|/gi, "");
};
