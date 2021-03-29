import { nanoid } from "nanoid";

import config from "server/config";
import { SummaryViewModel } from "../models";
import { PageController } from "./PageController";
import { redirectTo, redirectUrl, nonRelativeRedirectUrl } from "../helpers";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import {
  RelativeUrl,
  FeedbackContextInfo,
  decodeFeedbackContextInfo,
} from "../feedback";

const { payReturnUrl } = config;

export class SummaryPageController extends PageController {
  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      this.langFromRequest(request);

      const { cacheService } = request.services([]);
      const model = this.model;

      if (this.model.def.skipSummary) {
        return this.makePostRouteHandler()(request, h);
      }

      const state = await cacheService.getState(request);
      const viewModel = new SummaryViewModel(this.title, model, state, request);

      this.setFeedbackDetails(viewModel, request);

      if (viewModel.endPage) {
        return redirectTo(
          request,
          h,
          `/${model.basePath}${viewModel.endPage.path}`
        );
      }

      if (viewModel.errors) {
        const errorToFix = viewModel.errors[0];
        const { path } = errorToFix;
        const parts = path.split(".");
        const section = parts[0];
        const property = parts.length > 1 ? parts[parts.length - 1] : null;
        const iteration = parts.length === 3 ? Number(parts[1]) + 1 : null;
        const pageWithError = model.pages.filter((page) => {
          if (page.section && page.section.name === section) {
            let propertyMatches = true;
            let conditionMatches = true;
            if (property) {
              propertyMatches =
                page.components.formItems.filter(
                  (item) => item.name === property
                ).length > 0;
            }
            if (
              propertyMatches &&
              page.condition &&
              model.conditions[page.condition]
            ) {
              conditionMatches = model.conditions[page.condition].fn(state);
            }
            return propertyMatches && conditionMatches;
          }
          return false;
        })[0];
        if (pageWithError) {
          const params = {
            returnUrl: redirectUrl(request, `/${model.basePath}/summary`),
            num: iteration && pageWithError.repeatField ? iteration : null,
          };
          return redirectTo(
            request,
            h,
            `/${model.basePath}${pageWithError.path}`,
            params
          );
        }
      }

      const declarationError = request.yar.flash("declarationError");
      if (declarationError.length) {
        viewModel.declarationError = declarationError[0];
      }

      return h.view("summary", viewModel);
    };
  }

  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { payService, cacheService } = request.services([]);
      const model = this.model;
      const state = await cacheService.getState(request);
      const summaryViewModel = new SummaryViewModel(
        this.title,
        model,
        state,
        request
      );
      this.setFeedbackDetails(summaryViewModel, request);

      // redirect user to start page if there are incomplete form errors
      if (summaryViewModel.result.error) {
        console.error(`SummaryPage Error`, summaryViewModel.result.error);
        // default to first defined page
        let startPageRedirect = redirectTo(
          request,
          h,
          `/${model.basePath}${model.def.pages[0].path}`
        );
        const startPage = model.def.startPage;

        if (startPage.startsWith("http")) {
          startPageRedirect = redirectTo(request, h, startPage);
        } else if (model.def.pages.find((page) => page.path === startPage)) {
          startPageRedirect = redirectTo(
            request,
            h,
            `/${model.basePath}${startPage}`
          );
        }

        return startPageRedirect;
      }

      // request declaration
      if (summaryViewModel.declaration && !summaryViewModel.skipSummary) {
        const { declaration } = request.payload as { declaration?: any };

        if (!declaration) {
          request.yar.flash(
            "declarationError",
            "You must declare to be able to submit this application"
          );
          return redirectTo(
            request,
            h,
            `${request.headers.referer}#declaration`
          );
        }
        summaryViewModel.addDeclarationAsQuestion();
      }

      await cacheService.mergeState(request, {
        outputs: summaryViewModel.outputs,
      });
      await cacheService.mergeState(request, {
        webhookData: summaryViewModel.validatedWebhookData,
      });

      // no need to pay, redirect to status
      if (
        !summaryViewModel.fees ||
        (summaryViewModel.fees.details ?? []).length === 0
      ) {
        return redirectTo(request, h, "/status");
      }

      // user must pay for service
      const paymentReference = `FCO-${nanoid(10)}`;
      const description = payService.descriptionFromFees(summaryViewModel.fees);
      const res = await payService.payRequest(
        summaryViewModel.fees.total,
        paymentReference,
        description,
        summaryViewModel.payApiKey || "",
        nonRelativeRedirectUrl(request, payReturnUrl)
      );

      request.yar.set("basePath", model.basePath);
      await cacheService.mergeState(request, {
        pay: {
          payId: res.payment_id,
          reference: paymentReference,
          self: res._links.self.href,
          meta: {
            amount: summaryViewModel.fees.total,
            description,
            attempts: 1,
            payApiKey: summaryViewModel.payApiKey,
          },
        },
      });
      summaryViewModel.webhookDataPaymentReference = paymentReference;
      await cacheService.mergeState(request, {
        webhookData: summaryViewModel.validatedWebhookData,
      });

      return redirectTo(request, h, res._links.next_url.href);
    };
  }

  setFeedbackDetails(viewModel: SummaryViewModel, request: HapiRequest) {
    const feedbackContextInfo = this.getFeedbackContextInfo(request);

    if (feedbackContextInfo) {
      // set the form name to the source form name if this is a feedback form
      viewModel.name = feedbackContextInfo.formTitle;
    }

    // setting the feedbackLink to undefined here for feedback forms prevents the feedback link from being shown
    viewModel.feedbackLink = this.feedbackUrlFromRequest(request);
  }

  getFeedbackContextInfo(request: HapiRequest) {
    if (this.model.def.feedback?.feedbackForm) {
      const feedbackReturnInfo = new RelativeUrl(
        `${request.url.pathname}${request.url.search}`
      ).feedbackReturnInfo;

      if (feedbackReturnInfo) {
        return decodeFeedbackContextInfo(feedbackReturnInfo);
      }
    }
  }

  feedbackUrlFromRequest(request: HapiRequest) {
    if (this.model.def.feedback?.url) {
      let feedbackLink = new RelativeUrl(this.model.def.feedback.url);
      const returnInfo = new FeedbackContextInfo(
        this.model.name,
        "Summary",
        `${request.url.pathname}${request.url.search}`
      );
      feedbackLink.feedbackReturnInfo = returnInfo.toString();
      return feedbackLink.toString();
    }

    return undefined;
  }

  get postRouteOptions() {
    return {
      ext: {
        onPreHandler: {
          method: async (_request: HapiRequest, h: HapiResponseToolkit) => {
            return h.continue;
          },
        },
      },
    };
  }
}
