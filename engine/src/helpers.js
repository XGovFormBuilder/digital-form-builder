import { RelativeUrl } from "./feedback";

const paramsToCopy = [
  RelativeUrl.FEEDBACK_RETURN_INFO_PARAMETER,
  RelativeUrl.VISIT_IDENTIFIER_PARAMETER,
];

export function proceed(request, h, nextUrl) {
  const returnUrl = request.query.returnUrl;
  if (returnUrl && returnUrl.startsWith("/")) {
    return h.redirect(returnUrl);
  } else {
    return redirectTo(request, h, nextUrl);
  }
}

export function redirectUrl(request, targetUrl, params = {}) {
  const relativeUrl = new RelativeUrl(targetUrl);
  Object.entries(params).forEach(([name, value]) => {
    relativeUrl.setParam(name, value);
  });
  paramsToCopy.forEach((key) => {
    const value = request.query[key];
    if (value) {
      relativeUrl.addParamIfNotPresent(key, value);
    }
  });
  return relativeUrl.toString();
}

export function redirectTo(request, h, targetUrl, params = {}) {
  if (targetUrl.startsWith("http")) {
    return h.redirect(targetUrl);
  }
  return h.redirect(redirectUrl(request, targetUrl, params));
}
