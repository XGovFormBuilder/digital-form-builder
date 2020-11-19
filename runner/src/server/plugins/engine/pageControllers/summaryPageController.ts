import { nanoid } from "nanoid";
import { flatten } from "flat";
import { clone, reach } from "hoek";

import {
  decode,
  redirectTo,
  redirectUrl,
  RelativeUrl,
  FeedbackContextInfo,
  FormModel,
} from "..";
import { Data } from "@xgovformbuilder/model";

import { PageController } from "./pageController";
import config from "../../../config";
import { formSchema } from "../../../schemas/formSchema";
import { HapiRequest, HapiResponseToolkit } from "../../../types";
import type { Fees, FeeDetails } from "../../../services/payService";
import { FormSubmissionState } from "../types";
import { Fields, Questions, WebhookData } from "./types";

const { serviceName, payReturnUrl, notifyTemplateId, notifyAPIKey } = config;

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

class SummaryViewModel {
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
    this.endPage = endPage;
    const schema = model.makeFilteredSchema(state, relevantPages);
    const collatedRepeatPagesState = clone(state);

    Object.entries(collatedRepeatPagesState).forEach(([key, section]) => {
      if (key === "progress") {
        return;
      }
      if (Array.isArray(section)) {
        collatedRepeatPagesState[key] = section.map((pages) =>
          Object.values(pages).reduce(
            (acc: {}, p: any) => ({ ...acc, ...p }),
            {}
          )
        );
      }
    });

    const result = schema.validate(collatedRepeatPagesState, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (result.error) {
      this.processErrors(result, details);
    } else {
      this.fees = this.retrieveFees(model, state);
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
                outputData: this.notifyModel(
                  model,
                  output.outputConfiguration,
                  state
                ),
              };
            case "email":
              return {
                type: "email",
                outputData: this.emailModel(model, output.outputConfiguration),
              };
            case "webhook":
              return {
                type: "webhook",
                outputData: { url: output.outputConfiguration.url },
              };
            case "sheets":
              return {
                type: "sheets",
                outputData: this.sheetsModel(
                  model,
                  output.outputConfiguration,
                  state
                ),
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

  private retrieveFees(
    model: FormModel,
    state: FormSubmissionState
  ): Fees | undefined {
    let applicableFees: FeeDetails[] = [];

    if (model.def.fees) {
      applicableFees = model.def.fees.filter((fee) => {
        return !fee.condition || model.conditions[fee.condition].fn(state);
      });

      this._payApiKey = model.def.payApiKey;
      const flatState = flatten(state);

      return {
        details: applicableFees,
        total: Object.values(applicableFees)
          .map((fee) => {
            if (fee.multiplier) {
              const multiplyBy = flatState[fee.multiplier];
              fee.multiplyBy = Number(multiplyBy);
              return fee.multiplyBy * fee.amount;
            }
            return fee.amount;
          })
          .reduce((a, b) => a + b, 0),
      };
    }

    return undefined;
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
          const item = this.Item(request, component, sectionState, page, model);
          items.push(item);
          if (component.items) {
            const selectedValue = sectionState[component.name];
            const selectedItem = component.items.filter(
              (i) => i.value === selectedValue
            )[0];
            if (selectedItem && selectedItem.childrenCollection) {
              for (const cc of selectedItem.childrenCollection.formItems) {
                const cItem = this.Item(request, cc, sectionState, page, model);
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

  private notifyModel(
    model: FormModel,
    outputConfiguration,
    state: FormSubmissionState
  ) {
    const flatState = flatten(state);
    const personalisation = {};
    outputConfiguration.personalisation.forEach((p) => {
      const condition = model.conditions[p];
      personalisation[p] = condition ? condition.fn(state) : flatState[p];
    });
    return {
      templateId: outputConfiguration.templateId,
      personalisation,
      emailAddress: flatState[outputConfiguration.emailField],
      apiKey: outputConfiguration.apiKey,
    };
  }

  private emailModel(model: FormModel, outputConfiguration) {
    const data: string[] = [];

    this._webhookData?.questions?.forEach((question) => {
      data.push("---");
      data.push(`Page: ${question.question}\n`);
      question.fields.forEach((field) =>
        data.push(`*${field.title.replace("?", "")}: ${field.answer}\n`)
      );
    });
    data.push("---");

    const formName = model.name || `Form ${model.basePath}`;

    return {
      personalisation: {
        formName,
        formPayload: data.join("\r\n"),
      },
      apiKey: notifyAPIKey,
      templateId: notifyTemplateId,
      emailAddress: outputConfiguration.emailAddress,
    };
  }

  private sheetsModel(
    _model: FormModel,
    outputConfiguration,
    state: FormSubmissionState
  ) {
    const flatState = flatten(state);
    const { credentials, project_id, scopes } = outputConfiguration;
    const spreadsheetName = flatState[outputConfiguration.spreadsheetIdField];
    const spreadsheetId = outputConfiguration.sheets.find(
      (sheet) => sheet.name === spreadsheetName
    ).id;

    const data =
      this._webhookData?.questions?.map((question) =>
        question.fields.map((field) => field.answer)
      ) ?? [];

    return {
      data,
      authOptions: { credentials, projectId: project_id, scopes },
      spreadsheetId,
    };
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
    if (fees && fees.paymentReference) {
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

  Item(
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
        return this.Item(request, component, collated, page, model, {
          ...params,
          num: i + 1,
        });
      });
    }

    return {
      name: component.name,
      path: component.path, // TODO: Why is this always undefined?
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

  private addFeedbackSourceDataToWebhook(
    webhookData,
    model: FormModel,
    request
  ) {
    if (model.def.feedback?.feedbackForm) {
      const feedbackContextInfo = decode(
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
        redirectUrl(request, payReturnUrl)
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
        return decode(feedbackReturnInfo);
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
