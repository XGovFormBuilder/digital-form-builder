import btoa from "btoa";
import { RelativeUrl } from "./RelativeUrl";

export class FeedbackContextInfo {
  formTitle: string;
  pageTitle: string;
  url: string;

  constructor(formTitle, pageTitle, url) {
    this.formTitle = formTitle;
    this.pageTitle = pageTitle;
    // parse as a relative Url to ensure they're sensible values and prevent phishing
    this.url = url ? new RelativeUrl(url).toString() : url;
  }

  toString() {
    return btoa(JSON.stringify(this));
  }
}
