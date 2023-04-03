import { HapiRequest, HapiResponseToolkit } from "server/types";

export function handleFontCache(request: HapiRequest, h: HapiResponseToolkit) {
  const { response } = request;

  if ("isBoom" in response && response.isBoom) {
    return h.continue;
  }

  if ("header" in response && response.header) {
    response.header("X-Robots-Tag", "noindex, nofollow");

    const WEBFONT_EXTENSIONS = /\.(?:eot|ttf|woff|svg|woff2)$/i;
    if (!WEBFONT_EXTENSIONS.test(request.url.toString())) {
      response.header(
        "cache-control",
        "private, no-cache, no-store, must-revalidate, max-age=0"
      );
      response.header("pragma", "no-cache");
      response.header("expires", "0");
    } else {
      response.header("cache-control", "public, max-age=604800, immutable");
    }
  }
  return h.continue;
}
