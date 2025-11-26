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
import { FeesModel } from "server/plugins/engine/models/submission";
import { isMultipleApiKey } from "@xgovformbuilder/model";
import { FormComponent } from "../components";
import { SelectionControlField } from "../components/SelectionControlField";
import { PageControllerBase } from "./PageControllerBase";

const DEFAULT_OPTIONS = {
  customText: {},
};

export class CustomSummaryPageController extends PageController {
  returnUrlParameter: string;
  options: any;
  /**
   * The controller which is used when Page["controller"] is defined as "./pages/summary.js"
   */
  constructor(model, pageDef) {
    super(model, pageDef);
    const returnPath = `/${this.model.basePath}${this.path}`;
    this.returnUrlParameter = `?returnUrl=${encodeURIComponent(returnPath)}`;
    this.options = pageDef?.options ?? DEFAULT_OPTIONS;
    this.options.customText ??= DEFAULT_OPTIONS.customText;
  }
  /**
   * Returns an async function. This is called in plugin.ts when there is a GET request at `/{id}/{path*}`,
   */
  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      this.langFromRequest(request);

      const { cacheService } = request.services([]);
      const model = this.model;

      // @ts-ignore - ignoring so docs can be generated. Remove when properly typed
      if (this.model.def.skipSummary) {
        return this.makePostRouteHandler()(request, h);
      }
      const state = await cacheService.getState(request);

      const viewModel = await this.summaryViewModel(request);

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
      return h.view("custom-summary", viewModel);
    };
  }

  /**
   * Returns an async function. This is called in plugin.ts when there is a POST request at `/{id}/{path*}`.
   * If a form is incomplete, a user will be redirected to the start page.
   */
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
        const { declaration } = request.payload as {
          declaration?: any;
        };

        if (!declaration) {
          request.yar.flash(
            "declarationError",
            "You must declare to be able to submit this application"
          );
          const url = request.headers.referer ?? request.path;
          return redirectTo(request, h, `${url}#declaration`);
        }
        summaryViewModel.addDeclarationAsQuestion();
      }

      await cacheService.mergeState(request, {
        outputs: summaryViewModel.outputs,
        userCompletedSummary: true,
      });

      // Commented out due to potential for logging PII
      // request.logger.info(
      //   ["Webhook data", "before send", request.yar.id],
      //   JSON.stringify(summaryViewModel.validatedWebhookData)
      // );

      await cacheService.mergeState(request, {
        webhookData: summaryViewModel.validatedWebhookData,
      });

      const feesModel = FeesModel(model, state);

      /**
       * If a user does not need to pay, redirect them to /status
       */
      if ((feesModel?.details ?? [])?.length === 0) {
        return redirectTo(request, h, `/${request.params.id}/status`);
      }

      const payReturnUrl =
        this.model.feeOptions?.payReturnUrl ?? config.payReturnUrl;

      request.logger.info(
        `payReturnUrl has been configured to ${payReturnUrl}`
      );

      const url = new URL(
        `${payReturnUrl}/${request.params.id}/status`
      ).toString();

      const payStateMeta = payService.createPayStateMeta({
        feesModel: feesModel!,
        payApiKey: this.payApiKey,
        url,
      });

      const res = await payService.payRequestFromMeta(payStateMeta);

      // TODO:- refactor - this is repeated in applicationStatus
      const payState = {
        pay: {
          payId: res.payment_id,
          reference: res.reference,
          self: res._links.self.href,
          next_url: res._links.next_url.href,
          returnUrl: url,
          meta: payStateMeta,
        },
      };

      request.yar.set("basePath", model.basePath);
      await cacheService.mergeState(request, payState);
      summaryViewModel.webhookDataPaymentReference = res.reference;
      await cacheService.mergeState(request, {
        webhookData: summaryViewModel.validatedWebhookData,
      });

      const payRedirectUrl = payState.pay.next_url;
      const { showPaymentSkippedWarningPage } = this.model.feeOptions;

      const { skipPayment } = request.payload;
      if (skipPayment === "true" && showPaymentSkippedWarningPage) {
        payState.pay.meta.attempts = 0;
        await cacheService.mergeState(request, payState);
        return h
          .redirect(`/${request.params.id}/status/payment-skip-warning`)
          .takeover();
      }

      await cacheService.mergeState(request, payState);
      return h.redirect(payRedirectUrl);
    };
  }

  async summaryViewModel(request: HapiRequest) {
    const { cacheService } = request.services([]);
    const state = await cacheService.getState(request);
    const { progress = [] } = state;

    const { relevantPages } = this.model.getRelevantPages(state);

    const rowsBySection = relevantPages.reduce((prev, page) => {
      let displaySectionName;
      displaySectionName = page.sectionForEndSummaryPages || page.section?.name;

      // Always use section name for state access
      const stateSectionName = page.section?.name;

      const section = prev[displaySectionName] ?? [];
      let sectionState = stateSectionName
        ? state[stateSectionName] || {}
        : state;

      const toRow = this.formItemsToRowByPage({
        page,
        sectionState,
        fullState: state,
      });

      // Process each form item
      page.components.formItems.forEach((component) => {
        const result = toRow(component);
        if (Array.isArray(result)) {
          // If result is an array (from nested components), add each item
          section.push(...result);
        } else {
          // Otherwise, add the single row
          section.push(result);
        }
      });

      prev[displaySectionName] = section;
      return prev;
    }, {});

    const summaryLists = Object.entries(rowsBySection).map(
      ([section, rows]) => {
        const modelSection = this.model.sections.find(
          (mSection) => mSection.name === section
        );

        return {
          sectionTitle: !modelSection?.hideTitle ? modelSection?.title : "",
          section,
          rows,
        };
      }
    );

    return {
      page: this,
      pageTitle: this.title,
      sectionTitle: this.section?.title,
      backLink: progress[progress.length - 1] ?? this.backLinkFallback,
      name: this.model.name,
      summaryLists,
      showTitle: true,
      customText: this.options.customText,
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
      if (request.url.searchParams.get(feedbackReturnInfoKey)) {
        return decodeFeedbackContextInfo(
          request.url.searchParams.get(feedbackReturnInfoKey)
        );
      }
    }
  }

  feedbackUrlFromRequest(request: HapiRequest) {
    const feedbackUrl = this.model.def.feedback?.url;
    if (feedbackUrl) {
      if (feedbackUrl.startsWith("http")) {
        return feedbackUrl;
      }

      const relativeFeedbackUrl = new RelativeUrl(feedbackUrl);
      const returnInfo = new FeedbackContextInfo(
        this.model.name,
        "Summary",
        `${request.url.pathname}${request.url.search}`
      );
      relativeFeedbackUrl.setParam(feedbackReturnInfoKey, returnInfo.toString());
      return relativeFeedbackUrl.toString();
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

  formItemsToRowByPage({
    page,
    sectionState,
    fullState,
  }: {
    page: PageControllerBase;
    sectionState: { [key: string]: any };
    fullState: { [key: string]: any };
  }) {
    const pagePath = `/${page.model.basePath}${page.path}`;
    const returnPath = `${pagePath}${this.returnUrlParameter}`;
    const model = this.model;

    // Helper function to process components recursively
    const processComponent = (
      component: FormComponent,
      parentComponent?: FormComponent
    ): any[] => {
      const rows = [];

      // Process the current component if it has a name (is a form field)
      if (component.name) {
        // Get initial display value
        let valueText = component.getDisplayStringFromState(sectionState);

        if (
          component.type === "FileUploadField" &&
          model.showFilenamesOnSummaryPage
        ) {
          valueText =
            fullState.originalFilenames?.[component.name]?.originalFilename;
        }

        const alternateValue = this.findDisplayValue(component, valueText);
        if (alternateValue) {
          valueText = alternateValue;
        }

        // Use summaryTitle if available from options, otherwise fall back to title
        const displayTitle = component.options?.summaryTitle ?? component.title;

        rows.push({
          key: {
            text: displayTitle,
          },
          value: {
            text: valueText || "Not supplied",
          },
          actions: {
            items: [
              {
                text: "Change",
                visuallyHiddenText: displayTitle,
                href: returnPath,
              },
            ],
          },
        });
      }

      // Handle SelectionControlField conditionally revealed components
      if (component instanceof SelectionControlField && component.items) {
        // Find selected items
        const selectedValue = sectionState[component.name];
        const selectedValues = Array.isArray(selectedValue)
          ? selectedValue
          : [selectedValue];

        // Process conditionally revealed components for selected items
        component.items.forEach((item) => {
          if (
            item.hasConditionallyRevealedComponents &&
            selectedValues.includes(item.value)
          ) {
            // Process all components in the conditionally revealed section
            item.conditionallyRevealedComponents.items.forEach(
              (conditionalComponent) => {
                // For nested components, check if they have their own summaryTitle
                const nestedRows = processComponent(
                  conditionalComponent,
                  component
                );

                rows.push(...nestedRows);
              }
            );
          }
        });
      }

      return rows;
    };

    return (component: FormComponent) => {
      const result = processComponent(component);
      return result.length === 1 ? result[0] : result;
    };
  }

  findDisplayValue(
    component: FormComponent,
    value: string
  ): string | undefined {
    // Check if the component has items list
    if (component.items && Array.isArray(component.items)) {
      // Find the item where the text or value matches the input value
      const matchedItem = component.items.find(
        (item) => item.text === value || item.value === value
      );

      // Return value2 if it exists, otherwise return undefined
      return matchedItem?.checkpointDisplayValue || matchedItem?.text;
    }

    // If no items list or no match found, return undefined
    return undefined;
  }

  get payApiKey(): string {
    const modelDef = this.model.def;
    const payApiKey = modelDef.feeOptions?.payApiKey ?? def.payApiKey;

    if (isMultipleApiKey(payApiKey)) {
      return payApiKey[config.apiEnv] ?? payApiKey.test ?? payApiKey.production;
    }
    return payApiKey;
  }
}
