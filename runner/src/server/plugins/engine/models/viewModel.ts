import { HapiRequest } from "src/server/types";
import { FormModel } from "server/plugins/engine/models/FormModel";
import { FormSubmissionState } from "server/plugins/engine/types";
import {
  EmailModel,
  FeesModel,
  NotifyModel,
} from "server/plugins/engine/models/submission";
import { decodeFeedbackContextInfo, redirectUrl } from "server/plugins/engine";
import { feedbackReturnInfoKey } from "server/plugins/engine/helpers";
import {
  FEEDBACK_CONTEXT_ITEMS,
  WebhookData,
} from "server/plugins/engine/models/types";
import { webhookSchema } from "server/schemas/webhookSchema";
import config from "server/config";
import { FormDefinition, isMultipleApiKey } from "@xgovformbuilder/model";
import { SummaryPageController } from "server/plugins/engine/pageControllers";
import { InitialiseSessionOptions } from "server/plugins/initialiseSession/types";
import { reach } from "hoek";

export class ViewModel {
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
  contactUsUrl: string | undefined;
  privacyPolicyUrl: string | undefined;
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
  backLinkText?: string | undefined;
  containsFileType?: boolean;
  saveAndContinueText: string;
  continueText: string;
  footer?: any;

  constructor(
    pageTitle: string,
    model: FormModel,
    state: FormSubmissionState,
    request: HapiRequest
  ) {
    this.pageTitle = pageTitle;
    const { relevantPages, endPage } = ViewModel.getRelevantPages(model, state);
    const details = this.summaryDetails(request, model, state, relevantPages);
    const { def } = model;
    // @ts-ignore
    this.declaration = def.declaration;
    // @ts-ignore
    this.skipSummary = def.skipSummary;
    this._payApiKey = def.payApiKey;
    this.endPage = endPage;
    this.feedbackLink =
      def.feedback?.url ??
      ((def.feedback?.emailAddress && `mailto:${def.feedback?.emailAddress}`) ||
        config.feedbackLink);
    this.contactUsUrl = config.contactUsUrl;
    this.privacyPolicyUrl = config.privacyPolicyUrl;

    this.saveAndContinueText = "Save and continue";

    if (model?.def?.metadata?.isWelsh) {
      this.saveAndContinueText = "Cadw a pharhau";
    }

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
              outputData: NotifyModel(model, output.outputConfiguration, state),
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
              outputData: { url: output.outputConfiguration.url },
            };
          case "savePerPage":
            return {
              type: "savePerPage",
              outputData: { url: output.outputConfiguration.savePerPageUrl },
            };
          default:
            return {};
        }
      });
    }

    this.details = details;
    this.state = state;
    this.callback = state.callback;
  }

  protected summaryDetails(
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

          if (item.type === "FileUploadField") {
            item.value = this.splitFileName(item.value);
          }
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
        let notSuppliedText = "Not supplied";
        let changeText = "Change";
        if (model?.def?.metadata?.isWelsh) {
          notSuppliedText = "Heb ei ddarparu";
          changeText = "Newid";
        }
        if (Array.isArray(sectionState)) {
          details.push({
            name: section?.name,
            title: section?.title,
            items: [...Array(reach(state, repeatablePage.repeatField))].map(
              (_x, i) => {
                return items.map((item) => item[i]);
              }
            ),
            notSuppliedText: notSuppliedText,
            changeText,
          });
        } else {
          details.push({
            name: section?.name,
            title: section?.title,
            items,
            notSuppliedText: notSuppliedText,
            changeText,
          });
        }
      }
    });

    return details;
  }

  static getRelevantPages(model: FormModel, state: FormSubmissionState) {
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
      return config.apiEnv === "production"
        ? this._payApiKey.production ?? this._payApiKey.test
        : this._payApiKey.test ?? this._payApiKey.production;
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

  protected addFeedbackSourceDataToWebhook(
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

  splitFileName(fileName: string) {
    if (typeof fileName !== "undefined") {
      let value = fileName.split("/");
      return value[value.length - 1];
    }
  }
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
  params: {
    num?: number;
    returnUrl: string;
    form_session_identifier?: string;
  } = {
    returnUrl: redirectUrl(request, `/${model.basePath}/summary`),
  }
) {
  if (component?.options?.noReturnUrlOnSummaryPage === true) {
    delete params.returnUrl;
  }

  const isRepeatable = !!page.repeatField;

  if (request.query.form_session_identifier) {
    params.form_session_identifier = request.query.form_session_identifier;
  }

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
    prefix: component.options.prefix,
  };
}
