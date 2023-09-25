import { SummaryViewModel } from "../models";
import { PageController } from "./PageController";
import { feedbackReturnInfoKey, redirectTo, redirectUrl } from "../helpers";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import {
  decodeFeedbackContextInfo,
  FeedbackContextInfo,
  RelativeUrl,
} from "../feedback";
import config from "server/config";

export class SummaryPageController extends PageController {
  /**
   * The controller which is used when Page["controller"] is defined as "./pages/summary.js"
   */

  /**
   * Returns an async function. This is called in plugin.ts when there is a GET request at `/{id}/{path*}`,
   */
  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      this.langFromRequest(request);

      const { cacheService, uploadService } = request.services([]);
      const model = this.model;

      // @ts-ignore - ignoring so docs can be generated. Remove when properly typed
      if (this.model.def.skipSummary) {
        return this.makePostRouteHandler()(request, h);
      }
      const state = await cacheService.getState(request);
      const viewModel = new SummaryViewModel(this.title, model, state, request);

      const { relevantPages } = SummaryViewModel.getRelevantPages(model, state);
      const clientSideUploadComponents = relevantPages
        .filter(
          (page) => page.components.additionalValidationFunctions.length > 0
        )
        .flatMap((page) =>
          page.components.items
            .filter((item) => item.type == "ClientSideFileUploadField")
            .flatMap((x) => x)
        );

      const errorPromises = clientSideUploadComponents.map((component) => {
        const funcs = component.getAdditionalValidationFunctions();
        return Promise.all(
          funcs.map((func) => func(request, { components: [component] }))
        );
      });
      const nestedErrors = await Promise.all(errorPromises);
      const errors = nestedErrors.flat(Infinity);
      if (errors.length > 0) {
        const restructuredErrors = errors.map(({ name, path, text }) => {
          return {
            path: path,
            name: name,
            message: text,
          };
        });
        const allErrorsUnsorted = [
          ...(viewModel.errors || []),
          ...restructuredErrors,
        ];

        const sortedPathNames = relevantPages
          .filter(
            (page) => page.section?.name && page.components.items.length > 0
          )
          .map((page) => [
            page.section?.name,
            page.components.items.map((item) => item.name),
          ])
          .flatMap(([prefix, suffixes]) =>
            suffixes.map((suffix) => `${prefix}.${suffix}`)
          );

        const sortedErrors = [...allErrorsUnsorted].sort((a, b) => {
          const indexA = sortedPathNames.indexOf(a.path);
          const indexB = sortedPathNames.indexOf(b.path);

          return indexA - indexB;
        });

        viewModel.errors = sortedErrors;
      }

      viewModel.footer = this.def.footer;

      const form_session_identifier =
        state.metadata?.form_session_identifier ?? "";
      if (form_session_identifier) {
        for (const detail of viewModel.details) {
          const comps = detail.items.filter(
            (c) => c.type === "ClientSideFileUploadField"
          );
          for (const comp of comps) {
            const folderPath = `${comp.pageId}/${comp.name}`;
            const files = await uploadService.listFilesInBucketFolder(
              `${form_session_identifier}${folderPath}`,
              form_session_identifier
            );
            comp.value = {
              folderPath,
              files,
            };
          }
        }
      }

      if (viewModel.endPage) {
        return redirectTo(
          request,
          h,
          `/${model.basePath}${viewModel.endPage.path}`
        );
      }

      /**
       * iterates through the errors. If there are errors, a user will be redirected to the page
       * with the error with returnUrl=`/${model.basePath}/summary` in the URL query parameter.
       */
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

      const markAsCompleteError = request.yar.flash("markAsCompleteError");
      if (markAsCompleteError.length) {
        viewModel.markAsCompleteError = markAsCompleteError[0];
      }

      viewModel.details.find((value, index) => {
        viewModel.containsFileType = value.items.some(
          (item) => item.type === "FileUploadField"
        );
      });

      viewModel.details.find((value, index) => {
        for (let item of value.items) {
          if (item.type === "UkAddressField") {
            item.value = item.value.replace(/, null/g, "");
          }
          // New lines wont render on the summary page
          if (item.type === "FreeTextField" && item.value) {
            item.value = item.value.replace(/\r\n/g, "");
          }
        }
      });

      return h.view("summary", viewModel);
    };
  }

  /**
   * Returns an async function. This is called in plugin.ts when there is a POST request at `/{id}/{path*}`.
   * If a form is incomplete, a user will be redirected to the start page.
   */
  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { payService, cacheService, uploadService } = request.services([]);
      const model = this.model;
      const state = await cacheService.getState(request);
      state.metadata.isSummaryPageSubmit = true;
      await cacheService.mergeState(request, { ...state });

      const summaryViewModel = new SummaryViewModel(
        this.title,
        model,
        state,
        request
      );

      const { relevantPages } = SummaryViewModel.getRelevantPages(model, state);
      const clientSideUploadComponents = relevantPages
        .filter(
          (page) => page.components.additionalValidationFunctions.length > 0
        )
        .flatMap((page) =>
          page.components.items
            .filter((item) => item.type == "ClientSideFileUploadField")
            .flatMap((x) => x)
        );

      const errorPromises = clientSideUploadComponents.map((component) => {
        const funcs = component.getAdditionalValidationFunctions();
        return Promise.all(
          funcs.map((func) => func(request, { components: [component] }))
        );
      });
      const nestedErrors = await Promise.all(errorPromises);
      const errors = nestedErrors.flat(Infinity);
      if (errors.length > 0) {
        const restructuredErrors = errors.map(({ name, path, text }) => {
          return {
            path: path,
            name: name,
            message: text,
          };
        });
        const allErrorsUnsorted = [
          ...(summaryViewModel.errors || []),
          ...restructuredErrors,
        ];

        const sortedPathNames = model.pages
          .filter(
            (page) => page.section?.name && page.components.items.length > 0
          )
          .map((page) => [
            page.section?.name,
            page.components.items.map((item) => item.name),
          ])
          .flatMap(([prefix, suffixes]) =>
            suffixes.map((suffix) => `${prefix}.${suffix}`)
          );

        const sortedErrors = [...allErrorsUnsorted].sort((a, b) => {
          const indexA = sortedPathNames.indexOf(a.path);
          const indexB = sortedPathNames.indexOf(b.path);

          return indexA - indexB;
        });

        summaryViewModel.errors = sortedErrors;
      }

      const form_session_identifier =
        state.metadata?.form_session_identifier ?? "";
      if (form_session_identifier) {
        for (const detail of summaryViewModel.details) {
          const comps = detail.items.filter(
            (c) => c.type === "ClientSideFileUploadField"
          );
          for (const comp of comps) {
            const folderPath = `${comp.pageId}/${comp.name}`;
            const files = await uploadService.listFilesInBucketFolder(
              `${form_session_identifier}${folderPath}`,
              form_session_identifier
            );
            comp.value = {
              folderPath,
              files,
            };
          }
        }
      }

      this.setFeedbackDetails(summaryViewModel, request);
      this.setContactUsDetails(summaryViewModel, request);
      this.setPrivacyDetails(summaryViewModel, request);

      // redirect user to start page if there are incomplete form errors
      if (summaryViewModel.result.error) {
        request.logger.error(
          `SummaryPage Error`,
          summaryViewModel.result.error
        );
        /** defaults to the first page */
        // @ts-ignore - tsc reports an error here, ignoring so docs can be generated (does not cause eslint errors otherwise). Remove when properly typed
        let startPageRedirect = redirectTo(
          request,
          h,
          `/${model.basePath}${model.def.pages[0].path}`
        );
        const startPage = model.def.startPage;

        // @ts-ignore - tsc reports an error here, ignoring so docs can be generated (does not cause eslint errors otherwise). Remove when properly typed
        if (startPage.startsWith("http")) {
          // @ts-ignore - tsc reports an error here, ignoring so docs can be generated (does not cause eslint errors otherwise). Remove when properly typed
          startPageRedirect = redirectTo(request, h, startPage);
        } else if (model.def.pages.find((page) => page.path === startPage)) {
          // @ts-ignore - tsc reports an error here, ignoring so docs can be generated (does not cause eslint errors otherwise). Remove when properly typed
          startPageRedirect = redirectTo(
            request,
            h,
            `/${model.basePath}${startPage}`
          );
        }

        return startPageRedirect;
      }

      /**
       * If a form is configured with a declaration, a checkbox will be rendered with the configured declaration text.
       * If the user does not agree to the declaration, the page will be rerendered with a warning.
       */
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

      if (summaryViewModel.markAsCompleteComponent) {
        const { markAsComplete } = request.payload as { markAsComplete?: any };

        if (!markAsComplete) {
          request.yar.flash("markAsCompleteError", "You must select yes or no");
          return redirectTo(
            request,
            h,
            `${request.headers.referer}#markAsComplete`
          );
        }
        summaryViewModel.addMarkAsCompleteAsQuestion(
          markAsComplete.toLowerCase() === "true"
        );
      }

      await cacheService.mergeState(request, {
        outputs: summaryViewModel.outputs,
        userCompletedSummary: true,
      });
      await cacheService.mergeState(request, {
        webhookData: summaryViewModel.validatedWebhookData,
      });

      /**
       * If a user does not need to pay, redirect them to /status
       */
      if (
        !summaryViewModel.fees ||
        (summaryViewModel.fees.details ?? []).length === 0
      ) {
        return redirectTo(request, h, `/${request.params.id}/status`);
      }

      // user must pay for service
      const description = payService.descriptionFromFees(summaryViewModel.fees);
      const url = new URL(
        `${config.payReturnUrl}/${request.params.id}/status`
      ).toString();
      const res = await payService.payRequest(
        summaryViewModel.fees,
        summaryViewModel.payApiKey || "",
        url
      );

      request.yar.set("basePath", model.basePath);
      await cacheService.mergeState(request, {
        pay: {
          payId: res.payment_id,
          reference: res.reference,
          self: res._links.self.href,
          returnUrl: new URL(
            `${config.payReturnUrl}/${request.params.id}/status`
          ).toString(),
          meta: {
            amount: summaryViewModel.fees.total,
            description,
            attempts: 1,
            payApiKey: summaryViewModel.payApiKey,
          },
        },
      });
      summaryViewModel.webhookDataPaymentReference = res.reference;
      await cacheService.mergeState(request, {
        webhookData: summaryViewModel.validatedWebhookData,
      });

      return redirectTo(request, h, res._links.next_url.href);
    };
  }

  setPrivacyDetails(viewModel: SummaryViewModel, request: HapiRequest) {
    let privacyPolicyUrl: string;
    if (request.query.form_session_identifier) {
      privacyPolicyUrl =
        this.getConfiguredPrivacyLink() +
        "?application_id=" +
        request.query.form_session_identifier;
    } else {
      privacyPolicyUrl = this.getConfiguredPrivacyLink();
    }
    viewModel.privacyPolicyUrl = privacyPolicyUrl;
  }

  getConfiguredPrivacyLink() {
    return config.privacyPolicyUrl;
  }

  setContactUsDetails(viewModel: SummaryViewModel, request: HapiRequest) {
    let contactUsUrl: string;
    if (request.query.form_session_identifier) {
      contactUsUrl =
        this.getConfiguredContactUsLink() +
        "?application_id=" +
        request.query.form_session_identifier;
    } else {
      contactUsUrl = this.getConfiguredContactUsLink();
    }
    viewModel.contactUsUrl = contactUsUrl;
  }

  getConfiguredContactUsLink() {
    return config.contactUsUrl;
  }

  setFeedbackDetails(viewModel: SummaryViewModel, request: HapiRequest) {
    const feedbackContextInfo = this.getFeedbackContextInfo(request);

    if (feedbackContextInfo) {
      // set the form name to the source form name if this is a feedback form
      viewModel.name = feedbackContextInfo.formTitle;
    }

    // setting the feedbackLink to undefined here for feedback forms prevents the feedback link from being shown
    viewModel.feedbackLink = this.feedbackUrlFromRequest(request);
    if (!viewModel.feedbackLink) {
      let feedbackLink: string;
      if (request.query.form_session_identifier) {
        feedbackLink =
          this.getConfiguredFeedbackLink() +
          "?application_id=" +
          request.query.form_session_identifier;
      } else {
        feedbackLink = this.getConfiguredFeedbackLink();
      }
      viewModel.feedbackLink = feedbackLink;
    }
  }

  getConfiguredFeedbackLink() {
    return config.feedbackLink;
  }

  getFeedbackContextInfo(request: HapiRequest) {
    if (this.model.def.feedback?.feedbackForm) {
      if (request.url.searchParams.get(feedbackReturnInfoKey)) {
        return decodeFeedbackContextInfo(
          request.url.searchParams.get(feedbackReturnInfoKey)
        );
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
      feedbackLink.setParam(feedbackReturnInfoKey, returnInfo.toString());
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
