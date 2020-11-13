import { URL } from "url";
/**
 * Enforces use of relative URL's, prevents someone maliciously causing a user to be directed to a phishing
 * site.
 **/
export class RelativeUrl {
  static FEEDBACK_RETURN_INFO_PARAMETER = "f_t";
  static VISIT_IDENTIFIER_PARAMETER = "visit";
  url: URL;
  originalUrlString: string;

  constructor(urlString: string) {
    this.url = new URL(urlString, "http://www.example.com");
    this.originalUrlString = urlString;

    if (this.url.hostname !== "www.example.com") {
      throw Error("Only relative URLs are allowed");
    }
  }

  addParamIfNotPresent(name: string, value: string) {
    if (!this.url.searchParams.get(name)) {
      this.url.searchParams.set(name, value);
    }
    return this;
  }

  set feedbackReturnInfo(value: string | null) {
    this.setParam(RelativeUrl.FEEDBACK_RETURN_INFO_PARAMETER, value);
  }

  get feedbackReturnInfo(): string | null {
    return this.getParam(RelativeUrl.FEEDBACK_RETURN_INFO_PARAMETER) || null;
  }

  set visitIdentifier(value: string | null) {
    this.setParam(RelativeUrl.VISIT_IDENTIFIER_PARAMETER, value);
  }

  get visitIdentifier(): string | null {
    return this.getParam(RelativeUrl.VISIT_IDENTIFIER_PARAMETER) || null;
  }

  setParam(name: string, value: string | null) {
    this.url.searchParams.set(name, value || "");
    return this;
  }

  getParam(name: string) {
    return this.url.searchParams.get(name);
  }

  toString() {
    let url = this.url.pathname + this.url.search;
    if (url.startsWith("/") && !this.originalUrlString.startsWith("/")) {
      url = url.substr(1);
    }
    return url;
  }
}
