import { nanoid } from "nanoid";

import { SummaryViewModel } from "../models";
import { PageController } from "./PageController";
import { redirectTo, redirectUrl, feedbackReturnInfoKey } from "../helpers";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import {
  RelativeUrl,
  FeedbackContextInfo,
  decodeFeedbackContextInfo,
} from "../feedback";

export class ApplicationCompleteController extends PageController {
  /**
   * The controller which is used when Page["controller"] is defined as "./pages/ApplicationCompleteController"
   */

  /**
   * Returns an async function. This is called in plugin.ts when there is a GET request at `/{id}/{path*}`,
   */
  makeGetRouteHandler() {}

  /**
   * Returns an async function. This is called in plugin.ts when there is a POST request at `/{id}/{path*}`.
   * If a form is incomplete, a user will be redirected to the start page.
   */
  makePostRouteHandler() {}
}
