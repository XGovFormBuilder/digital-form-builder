import { clone, reach } from "hoek";
import config from "server/config";
import { FormModel } from "./FormModel";
import { feedbackReturnInfoKey, redirectUrl } from "../helpers";
import { decodeFeedbackContextInfo } from "../feedback";
import { webhookSchema } from "server/schemas/webhookSchema";
import { SummaryPageController } from "../pageControllers";
import { FormSubmissionState } from "../types";
import { FEEDBACK_CONTEXT_ITEMS, WebhookData } from "./types";
import {
  EmailModel,
  FeesModel,
  NotifyModel,
  WebhookModel,
} from "server/plugins/engine/models/submission";
import { FormDefinition, isMultipleApiKey } from "@xgovformbuilder/model";
import { HapiRequest } from "src/server/types";
import { InitialiseSessionOptions } from "server/plugins/initialiseSession/types";

/**
 * TODO - extract submission behaviour dependencies from the viewmodel
 * skipSummary (replace with reference to this.def.skipSummary?)
 * _payApiKey
 * replace result with errors?
 * remove state and value?
 *
 * TODO - Pull out summary behaviours into separate service classes?
 */

export class SummaryViewModel {
  /**
   * Responsible for parsing state values to the govuk-frontend summary list template and parsing data for outputs
   * The plain object is also used to generate data for outputs
   */

  pageTitle: string;
  declaration: any; // TODO
  skipSummary: boolean;
  endPage: any; // TODO
  result: any;
  details: any;
  state: any;
  value: any;
  fees: FeesModel | undefined;
  name: string | undefined;
  feedbackLink: string | undefined;
  phaseTag: string | undefined;
  declarationError: any; // TODO
  errors:
    | {
        path: string;
        name: string;
        message: string;
      }[]
    | undefined;

  _outputs: any; // TODO
  _payApiKey: FormDefinition["payApiKey"];
  _webhookData: WebhookData | undefined;
  callback?: InitialiseSessionOptions;
  showPaymentSkippedWarningPage: boolean = false;
  constructor(
    pageTitle: string,
    model: FormModel,
    state: FormSubmissionState,
    request: HapiRequest
  ) {
    this.pageTitle = pageTitle;
    const { relevantPages, endPage } = this.getRelevantPages(model, state);
    const details = this.summaryDetails(request, model, state, relevantPages);
    const { def } = model;
    // @ts-ignore
    this.declaration = def.declaration;
    // @ts-ignore
    this.skipSummary = def.skipSummary;
    this._payApiKey = def.feeOptions?.payApiKey ?? def.payApiKey;
    this.endPage = endPage;
    this.feedbackLink =
      def.feedback?.url ??
      ((def.feedback?.emailAddress && `mailto:${def.feedback?.emailAddress}`) ||
        config.feedbackLink);

    const schema = model.makeFilteredSchema(state, relevantPages);
    const collatedRepeatPagesState = gatherRepeatPages(state);

    const result = schema.validate(collatedRepeatPagesState, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (result.error) {
      this.processErrors(result, details);
    } else {
      this.fees = FeesModel(model, state);

      this._webhookData = WebhookModel(
        relevantPages,
        details,
        model,
        this.fees,
        model.getContextState(state)
      );
      this._webhookData = this.addFeedbackSourceDataToWebhook(
        this._webhookData,
        model,
        request
      );

      /**
       * If there outputs defined, parse the state data for the appropriate outputs.
       * Skip outputs if this is a callback
       */
      if (def.outputs && !state.callback) {
        this._outputs = def.outputs.map((output) => {
          switch (output.type) {
            case "notify":
              return {
                type: "notify",
                outputData: NotifyModel(
                  model,
                  output.outputConfiguration,
                  state
                ),
              };
            case "email":
              return {
                type: "email",
                outputData: EmailModel(
                  model,
                  output.outputConfiguration,
                  this._webhookData
                ),
              };
            case "webhook":
              return {
                type: "webhook",
                outputData: {
                  url: output.outputConfiguration.url,
                  sendAdditionalPayMetadata:
                    output.outputConfiguration.sendAdditionalPayMetadata,
                  allowRetry: output.outputConfiguration.allowRetry,
                },
              };
            default:
              return {};
          }
        });
      }
    }

    this.result = result;
    this.details = details;
    this.state = state;
    this.value = result.value;
    this.callback = state.callback;
    const { feeOptions } = model;
    this.showPaymentSkippedWarningPage =
      feeOptions.showPaymentSkippedWarningPage ?? false;
  }

  private processErrors(result, details) {
    this.errors = result.error.details.map((err) => {
      const name = err.path[err.path.length - 1];

      return {
        path: err.path.join("."),
        name: name,
        message: err.message,
      };
    });

    details.forEach((detail) => {
      const sectionErr = this.errors?.find((err) => err.path === detail.name);

      detail.items.forEach((item) => {
        if (sectionErr) {
          item.inError = true;
          return;
        }

        const err = this.errors?.find(
          (err) =>
            err.path ===
            (detail.name ? detail.name + "." + item.name : item.name)
        );
        if (err) {
          item.inError = true;
        }
      });
    });
  }

  private summaryDetails(
    request,
    model: FormModel,
    state: FormSubmissionState,
    relevantPages
  ) {
    const details: object[] = [];

    [undefined, ...model.sections].forEach((section) => {
      const items: any[] = [];
      let sectionState = section ? state[section.name] || {} : state;

      const sectionPages = relevantPages.filter(
        (page) => page.section === section
      );

      const repeatablePage = sectionPages.find((page) => !!page.repeatField);
      // Currently can't handle repeatable page outside a section.
      // In fact currently if any page in a section is repeatable it's expected that all pages in that section will be
      // repeatable
      if (section && repeatablePage) {
        if (!state[section.name]) {
          state[section.name] = sectionState = [];
        }
        // Make sure the right number of items
        const requiredIterations = reach(state, repeatablePage.repeatField);
        if (requiredIterations < sectionState.length) {
          state[section.name] = sectionState.slice(0, requiredIterations);
        } else {
          for (let i = sectionState.length; i < requiredIterations; i++) {
            sectionState.push({});
          }
        }
      }

      sectionPages.forEach((page) => {
        for (const component of page.components.formItems) {
          const item = Item(request, component, sectionState, page, model);
          if (items.find((cbItem) => cbItem.name === item.name)) return;
          items.push(item);
          if (component.items) {
            const selectedValue = sectionState[component.name];
            const selectedItem = component.items.filter(
              (i) => i.value === selectedValue
            )[0];
            if (selectedItem && selectedItem.childrenCollection) {
              for (const cc of selectedItem.childrenCollection.formItems) {
                const cItem = Item(request, cc, sectionState, page, model);
                items.push(cItem);
              }
            }
          }
        }
      });

      if (items.length > 0) {
        if (Array.isArray(sectionState)) {
          details.push({
            name: section?.name,
            title: section?.title,
            items: [...Array(reach(state, repeatablePage.repeatField))].map(
              (_x, i) => {
                return items.map((item) => item[i]);
              }
            ),
          });
        } else {
          details.push({
            name: section?.name,
            title: section?.title,
            items,
          });
        }
      }
    });

    return details;
  }

  private getRelevantPages(model: FormModel, state: FormSubmissionState) {
    let nextPage = model.startPage;
    const relevantPages: any[] = [];
    let endPage = null;

    while (nextPage != null) {
      if (nextPage.hasFormComponents) {
        relevantPages.push(nextPage);
      } else if (
        !nextPage.hasNext &&
        !(nextPage instanceof SummaryPageController)
      ) {
        endPage = nextPage;
      }
      nextPage = nextPage.getNextPage(state, true);
    }

    return { relevantPages, endPage };
  }

  get validatedWebhookData() {
    const result = webhookSchema.validate(this._webhookData, {
      abortEarly: false,
      stripUnknown: true,
    });
    return result.value;
  }

  get webhookDataPaymentReference() {
    const fees = this._webhookData?.fees;

    if (fees && fees.paymentReference) {
      return fees.paymentReference;
    }

    return "";
  }

  set webhookDataPaymentReference(paymentReference: string) {
    const fees = this._webhookData?.fees;
    if (fees) {
      fees.paymentReference = paymentReference;
    }
  }

  get outputs() {
    return this._outputs;
  }

  set outputs(value) {
    this._outputs = value;
  }

  get payApiKey() {
    if (isMultipleApiKey(this._payApiKey)) {
      return (
        this._payApiKey[config.apiEnv] ??
        this._payApiKey.test ??
        this._payApiKey.production
      );
    }
    return this._payApiKey;
  }

  /**
   * If a declaration is defined, add this to {@link this._webhookData} as a question has answered `true` to
   */
  addDeclarationAsQuestion() {
    this._webhookData?.questions?.push({
      category: null,
      question: "Declaration",
      fields: [
        {
          key: "declaration",
          title: "Declaration",
          type: "boolean",
          answer: true,
        },
      ],
    });
  }

  private addFeedbackSourceDataToWebhook(
    webhookData,
    model: FormModel,
    request
  ) {
    if (model.def.feedback?.feedbackForm) {
      const feedbackContextInfo = decodeFeedbackContextInfo(
        request.url.searchParams.get(feedbackReturnInfoKey)
      );

      if (feedbackContextInfo) {
        webhookData.questions.push(
          ...FEEDBACK_CONTEXT_ITEMS.map((item) => ({
            category: null,
            question: item.display,
            fields: [
              {
                key: item.key,
                title: item.display,
                type: "string",
                answer: item.get(feedbackContextInfo),
              },
            ],
          }))
        );
      }
    }
    return webhookData;
  }
}

function gatherRepeatPages(state) {
  if (!!Object.values(state).find((section) => Array.isArray(section))) {
    return state;
  }
  const clonedState = clone(state);
  Object.entries(state).forEach(([key, section]) => {
    if (key === "progress") {
      return;
    }
    if (Array.isArray(section)) {
      clonedState[key] = section.map((pages) =>
        Object.values(pages).reduce((acc: {}, p: any) => ({ ...acc, ...p }), {})
      );
    }
  });
}

/**
 * Creates an Item object for Details
 */
function Item(
  request,
  component,
  sectionState,
  page,
  model: FormModel,
  params: { num?: number; returnUrl: string } = {
    returnUrl: redirectUrl(request, `/${model.basePath}/summary`),
  }
) {
  const isRepeatable = !!page.repeatField;

  //TODO:- deprecate in favour of section based and/or repeatingFieldPageController
  if (isRepeatable && Array.isArray(sectionState)) {
    return sectionState.map((state, i) => {
      const collated = Object.values(state).reduce(
        (acc: {}, p: any) => ({ ...acc, ...p }),
        {}
      );
      return Item(request, component, collated, page, model, {
        ...params,
        num: i + 1,
      });
    });
  }

  return {
    name: component.name,
    path: page.path,
    label: component.localisedString(component.title),
    value: component.getDisplayStringFromState(sectionState),
    rawValue: sectionState[component.name],
    url: redirectUrl(request, `/${model.basePath}${page.path}`, params),
    pageId: `/${model.basePath}${page.path}`,
    type: component.type,
    title: component.title,
    dataType: component.dataType,
    immutable: component.options.disableChangingFromSummary,
  };
}
