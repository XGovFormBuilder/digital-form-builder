import { clone, reach } from "hoek";
import { Data } from "@xgovformbuilder/model";

import config from "server/config";
import { FormModel } from "./FormModel";
import { redirectUrl } from "../helpers";
import { decodeFeedbackContextInfo, RelativeUrl } from "../feedback";
import { formSchema } from "server/schemas/formSchema";
import { SummaryPageController } from "../pageControllers";
import type { Fees } from "server/services/payService";
import { FormSubmissionState } from "../types";
import { Fields, Questions, WebhookData } from "./types";
import {
  FeesModel,
  EmailModel,
  NotifyModel,
} from "server/plugins/engine/models/submission";

const { serviceName } = config;

/**
 * TODO - extract submission behaviour dependencies from the viewmodel
 * Webhookdata
 * outputs
 * skipSummary (replace with reference to this.model.def.skipSummary?)
 * _payApiKey
 * replace result with errors?
 * remove state and value?
 *
 * TODO - Pull out summary behaviours into separate service classes?
 * TODO - Move outputs conversion to an outputs service?
 * TODO - Move outputs / pay integration etc etc into a submission service rather than applicationStatus.js
 */

export class SummaryViewModel {
  pageTitle: string;
  declaration: any; // TODO
  skipSummary: boolean;
  endPage: any; // TODO
  result: any;
  details: any;
  state: any;
  value: any;
  fees: Fees | undefined;
  name: string | undefined;
  feedbackLink: string | undefined;
  declarationError: any; // TODO
  errors:
    | {
        path: string;
        name: string;
        message: string;
      }[]
    | undefined;

  _outputs: any; // TODO
  _payApiKey: string | undefined;
  _webhookData: WebhookData | undefined;

  constructor(
    pageTitle: string,
    model: FormModel,
    state: FormSubmissionState,
    request
  ) {
    this.pageTitle = pageTitle;
    const { relevantPages, endPage } = this.getRelevantPages(model, state);
    const details = this.summaryDetails(request, model, state, relevantPages);
    this.declaration = model.def.declaration;
    this.skipSummary = model.def.skipSummary;
    this._payApiKey = model.def.payApiKey;
    this.endPage = endPage;
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
      this.parseDataForWebhook(model, relevantPages, details);
      this._webhookData = this.addFeedbackSourceDataToWebhook(
        this._webhookData,
        model,
        request
      );

      if (model.def.outputs) {
        this._outputs = model.def.outputs.map((output) => {
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
                outputData: { url: output.outputConfiguration.url },
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

  private toEnglish(localisableString) {
    let englishString = "";
    if (localisableString) {
      if (typeof localisableString === "string") {
        englishString = localisableString;
      } else {
        englishString = localisableString.en;
      }
    }
    return englishString;
  }

  private parseDataForWebhook(model: FormModel, relevantPages, details) {
    const questions: Questions = [];

    for (const page of relevantPages) {
      const category = page.section?.name;
      const isRepeatable = !!page.repeatField;
      const detail = details.find((d) => d.name === category);

      let question;
      if (page.title) {
        question = this.toEnglish(page.title);
      } else {
        question = page.components.formItems
          .map((item) => this.toEnglish(item.title))
          .join(", ");
      }

      let items;
      if (isRepeatable) {
        items = detail.items;
      } else {
        items = [detail.items];
      }

      for (let index = 0; index < items.length; index++) {
        const item = items[index].filter(
          (detailItem) => detailItem.pageId === `/${model.basePath}${page.path}`
        );
        const fields: Fields = [];

        for (const detailItem of item) {
          const answer =
            typeof detailItem.rawValue === "object"
              ? detailItem.value
              : detailItem.rawValue;
          fields.push({
            key: detailItem.name,
            title: this.toEnglish(detailItem.title),
            type: detailItem.dataType,
            answer,
          });

          if (detailItem.items) {
            const selectedItem = detailItem.items.filter(
              (i) => i.value === answer
            )[0];
            if (selectedItem && selectedItem.childrenCollection) {
              selectedItem.childrenCollection.formItems.forEach((cc) => {
                const itemDetailItem = detail.items.find(
                  (detailItem) => detailItem.name === cc.name
                );
                fields.push({
                  key: cc.name,
                  title: this.toEnglish(cc.title),
                  type: cc.dataType,
                  answer:
                    typeof itemDetailItem.rawValue === "object"
                      ? itemDetailItem.value
                      : itemDetailItem.rawValue,
                });
              });
            }
          }
        }

        questions.push({
          category,
          question,
          fields,
          index,
        });
      }
    }

    // default name if no name is provided
    let englishName = `${serviceName} ${model.basePath}`;
    if (model.name) {
      englishName = typeof model.name === "string" ? model.name : model.name.en;
    }

    this._webhookData = {
      metadata: model.def.metadata,
      name: englishName,
      questions: questions,
    };
    if (this.fees) {
      this._webhookData.fees = this.fees;
    }
  }

  get validatedWebhookData() {
    const result = formSchema.validate(this._webhookData, {
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
    return this._payApiKey;
  }

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
        new RelativeUrl(`${request.url.pathname}${request.url.search}`)
          .feedbackReturnInfo
      );

      if (feedbackContextInfo) {
        webhookData.questions.push(
          ...Data.FEEDBACK_CONTEXT_ITEMS.map((item) => ({
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
  };
}
