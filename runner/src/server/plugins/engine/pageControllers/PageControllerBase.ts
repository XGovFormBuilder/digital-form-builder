import { merge, reach } from "@hapi/hoek";
import * as querystring from "querystring";

import { feedbackReturnInfoKey, proceed, redirectTo } from "../helpers";
import { ComponentCollection } from "../components/ComponentCollection";
import {
  RelativeUrl,
  decodeFeedbackContextInfo,
  FeedbackContextInfo,
} from "../feedback";
import {
  HapiRequest,
  HapiResponseToolkit,
  HapiResponseObject,
} from "server/types";
import { FormModel } from "../models";
import {
  FormSubmissionState,
  FormSubmissionErrors,
  FormData,
  FormPayload,
} from "../types";
import { ComponentCollectionViewModel } from "../components/types";
import { Page } from "@xgovformbuilder/model";

const FORM_SCHEMA = Symbol("FORM_SCHEMA");
const STATE_SCHEMA = Symbol("STATE_SCHEMA");

export class PageControllerBase {
  /**
   * The base class for all page controllers. Page controllers are responsible for generating the get and post route handlers when a user navigates to `/{id}/{path*}`.
   */
  def: {
    name: string;
    feedback?: {
      url?: string;
      feedbackForm?: boolean;
      emailAddress?: string;
    };
  };
  name: string;
  model: FormModel;
  pageDef: any; // TODO
  path: string;
  title: string;
  condition: any; // TODO
  repeatField: any; // TODO
  section: any; // TODO
  components: ComponentCollection;
  hasFormComponents: boolean;
  hasConditionalFormComponents: boolean;

  // TODO: pageDef type
  constructor(model: FormModel, pageDef: { [prop: string]: any } = {}) {
    const { def } = model;

    // @ts-ignore
    this.def = def;
    // @ts-ignore
    this.name = def.name;
    this.model = model;
    this.pageDef = pageDef;
    this.path = pageDef.path;
    this.title = pageDef.title;
    this.condition = pageDef.condition;
    this.repeatField = pageDef.repeatField;

    // Resolve section
    this.section =
      pageDef.section &&
      model.sections.find((section) => section.name === pageDef.section);

    // Components collection
    const components = new ComponentCollection(pageDef.components, model);
    const conditionalFormComponents = components.formItems.filter(
      (c: any) => c.conditionalComponents
    );

    this.components = components;
    this.hasFormComponents = !!components.formItems.length;
    this.hasConditionalFormComponents = !!conditionalFormComponents.length;

    this[FORM_SCHEMA] = this.components.formSchema;
    this[STATE_SCHEMA] = this.components.stateSchema;
  }

  /**
   * Used for mapping FormData and errors to govuk-frontend's template api, so a page can be rendered
   * @param formData - contains a user's form payload, and any validation errors that may have occurred
   */
  getViewModel(
    formData: FormData,
    iteration?: any, // TODO
    errors?: any // TODO
  ): {
    page: PageControllerBase;
    name: string;
    pageTitle: string;
    sectionTitle: string;
    showTitle: boolean;
    components: ComponentCollectionViewModel;
    errors: FormSubmissionErrors;
    isStartPage: boolean;
    startPage?: HapiResponseObject;
    backLink?: string;
  } {
    let showTitle = true;
    let pageTitle = this.title;
    let sectionTitle = this.section?.title;
    if (sectionTitle && iteration !== undefined) {
      sectionTitle = `${sectionTitle} ${iteration}`;
    }
    const components = this.components.getViewModel(formData, errors);

    const formComponents = components.filter((c) => c.isFormComponent);
    const hasSingleFormComponent = formComponents.length === 1;
    const singleFormComponent = hasSingleFormComponent
      ? formComponents[0]
      : null;
    const singleFormComponentIsFirst =
      singleFormComponent && singleFormComponent === components[0];

    if (singleFormComponent && singleFormComponentIsFirst) {
      const label: any = singleFormComponent.model.label;

      if (pageTitle) {
        label.text = pageTitle;
      }

      label.isPageHeading = true;
      label.classes = "govuk-label--xl";
      pageTitle = pageTitle || label.text;
      showTitle = false;
    }

    return {
      page: this,
      name: this.name,
      pageTitle,
      sectionTitle,
      showTitle,
      components,
      errors,
      isStartPage: false,
    };
  }

  /**
   * utility function that checks if this page has any items in the {@link Page.next} object.
   */
  get hasNext() {
    return Array.isArray(this.pageDef.next) && this.pageDef.next.length > 0;
  }

  get next() {
    return (this.pageDef.next || [])
      .map((next: { path: string }) => {
        const { path } = next;
        const page = this.model.pages.find((page: PageControllerBase) => {
          return path === page.path;
        });

        if (!page) {
          return null;
        }

        return {
          ...next,
          page,
        };
      })
      .filter((v: {} | null) => !!v);
  }

  /**
   * @param state - the values currently stored in a users session
   * @param suppressRepetition - cancels repetition logic
   */
  getNextPage(state: FormSubmissionState, suppressRepetition = false) {
    if (this.repeatField && !suppressRepetition) {
      const requiredCount = reach(state, this.repeatField);
      const otherRepeatPagesInSection = this.model.pages.filter(
        (page) => page.section === this.section && page.repeatField
      );
      const sectionState = state[this.section.name] || {};
      if (
        Object.keys(sectionState[sectionState.length - 1]).length ===
        otherRepeatPagesInSection.length
      ) {
        // iterated all pages at least once
        const lastIteration = sectionState[sectionState.length - 1];
        if (
          otherRepeatPagesInSection.length === this.objLength(lastIteration)
        ) {
          // this iteration is 'complete'
          if (sectionState.length < requiredCount) {
            return this.findPageByPath(Object.keys(lastIteration)[0]);
          }
        }
      }
    }

    let defaultLink;
    const nextLink = this.next.find((link) => {
      const { condition } = link;
      if (condition) {
        return (
          this.model.conditions[condition] &&
          this.model.conditions[condition].fn(state)
        );
      }
      defaultLink = link;
      return false;
    });
    return nextLink?.page ?? defaultLink?.page;
  }

  // TODO: type
  /**
   * returns the path to the next page
   */
  getNext(state: any) {
    const nextPage = this.getNextPage(state);
    const query = { num: 0 };
    let queryString = "";
    if (nextPage?.repeatField) {
      const requiredCount = reach(state, nextPage.repeatField);
      const otherRepeatPagesInSection = this.model.pages.filter(
        (page) => page.section === this.section && page.repeatField
      );
      const sectionState = state[nextPage.section.name];
      const lastInSection = sectionState?.[sectionState.length - 1] ?? {};
      const isLastComplete =
        Object.keys(lastInSection).length === otherRepeatPagesInSection.length;
      query.num = sectionState
        ? isLastComplete
          ? this.objLength(sectionState) + 1
          : this.objLength(sectionState)
        : 1;

      if (query.num <= requiredCount) {
        queryString = `?${querystring.encode(query)}`;
      }
    }

    if (nextPage) {
      return `/${this.model.basePath || ""}${nextPage.path}${queryString}`;
    }
    return this.defaultNextPath;
  }

  // TODO: types
  /**
   * gets the state for the values that can be entered on just this page
   */
  getFormDataFromState(state: any, atIndex: number): FormData {
    const pageState = this.section ? state[this.section.name] : state;

    if (this.repeatField) {
      const repeatedPageState =
        pageState?.[atIndex ?? (pageState.length - 1 || 0)] ?? {};
      const values = Object.values(repeatedPageState);

      const newState = values.length
        ? values.reduce((acc: any, page: any) => ({ ...acc, ...page }), {})
        : {};

      return this.components.getFormDataFromState(
        newState as FormSubmissionState
      );
    }

    return this.components.getFormDataFromState(pageState || {});
  }

  getStateFromValidForm(formData: FormPayload) {
    return this.components.getStateFromValidForm(formData);
  }

  /**
   * Parses the errors from joi.validate so they can be rendered by govuk-frontend templates
   * @param validationResult - provided by joi.validate
   */
  getErrors(validationResult): FormSubmissionErrors | undefined {
    if (validationResult && validationResult.error) {
      return {
        titleText: this.errorSummaryTitle,
        errorList: validationResult.error.details.map((err) => {
          const name = err.path
            .map((name: string, index: number) =>
              index > 0 ? `__${name}` : name
            )
            .join("");

          return {
            path: err.path.join("."),
            href: `#${name}`,
            name: name,
            text: err.message,
          };
        }),
      };
    }

    return undefined;
  }

  /**
   * Runs {@link joi.validate}
   * @param value - user's answers
   * @param schema - which schema to validate against
   */
  validate(value, schema) {
    const result = schema.validate(value, this.validationOptions);
    const errors = result.error ? this.getErrors(result) : null;

    return { value: result.value, errors };
  }

  validateForm(payload) {
    return this.validate(payload, this.formSchema);
  }

  validateState(newState) {
    return this.validate(newState, this.stateSchema);
  }

  /**
   * returns the language set in a user's browser. Can be used for localisable strings
   */
  langFromRequest(request: HapiRequest) {
    const lang = request.query.lang || request.yar.get("lang") || "en";
    if (lang !== request.yar.get("lang")) {
      request.i18n.setLocale(lang);
      request.yar.set("lang", lang);
    }
    return request.yar.get("lang");
  }

  /**
   * Returns an async function. This is called in plugin.ts when there is a GET request at `/{id}/{path*}`
   */
  getConditionEvaluationContext(model: FormModel, state: FormSubmissionState) {
    //Note: This function does not support repeatFields right now

    let relevantState: FormSubmissionState = {};
    //Start at our startPage
    let nextPage = model.startPage;
    let previousPages: [Page["path"], Page["path"]?, Page["path"]?] = [
      model.startPage?.path,
    ];

    while (nextPage != null) {
      //Either get the current state or the current state of the section if this page belongs to a section
      const currentState =
        (nextPage.section ? state[nextPage.section.name] : state) ?? {};
      let newValue = {};

      //Iterate all components on this page and pull out the saved values from the state
      for (const component of nextPage.components.items) {
        newValue[component.name] = currentState[component.name];
      }

      if (nextPage.section) {
        newValue = { [nextPage.section.name]: newValue };
      }

      //Combine our stored values with the existing relevantState that we've been building up
      relevantState = merge(relevantState, newValue);

      //By passing our current relevantState to getNextPage, we will check if we can navigate to this next page (including doing any condition checks if applicable)
      const next = nextPage.getNextPage(relevantState);
      previousPages.length === 3 && previousPages.shift();
      next?.path && previousPages.push(next.path);

      /**
       * This prevents an infinite loop
       */
      if (previousPages[0] === next?.path) {
        nextPage = null;
      } else {
        //If a nextPage is returned, we must have taken that route through the form so continue our iteration with the new page
        nextPage = next;
      }
    }

    return relevantState;
  }

  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { cacheService } = request.services([]);
      const lang = this.langFromRequest(request);
      const state = await cacheService.getState(request);
      const progress = state.progress || [];
      const { num } = request.query;
      const currentPath = `/${this.model.basePath}${this.path}${request.url.search}`;
      const startPage = this.model.def.startPage;
      const formData = this.getFormDataFromState(state, num - 1);

      if (
        !this.model.options.previewMode &&
        progress.length === 0 &&
        this.path !== `${startPage}`
      ) {
        // @ts-ignore
        return startPage!.startsWith("http")
          ? redirectTo(request, h, startPage!)
          : redirectTo(request, h, `/${this.model.basePath}${startPage!}`);
      }

      formData.lang = lang;
      /**
       * We store the original filename for the user in a separate object (`originalFileNames`), however they are not used for any of the outputs. The S3 url is stored in the state.
       */
      const { originalFilenames } = state;
      if (originalFilenames) {
        Object.entries(formData).forEach(([key, value]) => {
          if (value && value === (originalFilenames[key] || {}).location) {
            formData[key] = originalFilenames[key].originalFilename;
          }
        });
      }

      const viewModel = this.getViewModel(formData, num);
      viewModel.startPage = startPage!.startsWith("http")
        ? redirectTo(request, h, startPage!)
        : redirectTo(request, h, `/${this.model.basePath}${startPage!}`);
      this.setFeedbackDetails(viewModel, request);

      /**
       * Content components can be hidden based on a condition. If the condition evaluates to true, it is safe to be kept, otherwise discard it
       */
      //Calculate our relevantState, which will filter out previously input answers that are no longer relevant to this user journey
      let relevantState = this.getConditionEvaluationContext(this.model, state);

      //Filter our components based on their conditions using our calculated state
      viewModel.components = viewModel.components.filter((component) => {
        if (
          (component.model.content || component.type === "Details") &&
          component.model.condition
        ) {
          const condition = this.model.conditions[component.model.condition];
          return condition.fn(relevantState);
        }
        return true;
      });
      /**
       * For conditional reveal components (which we no longer support until GDS resolves the related accessibility issues {@link https://github.com/alphagov/govuk-frontend/issues/1991}
       */
      viewModel.components = viewModel.components.map((component) => {
        const evaluatedComponent = component;
        const content = evaluatedComponent.model.content;
        if (content instanceof Array) {
          evaluatedComponent.model.content = content.filter((item) =>
            item.condition
              ? this.model.conditions[item.condition].fn(relevantState)
              : true
          );
        }
        // apply condition to items for radios, checkboxes etc
        const items = evaluatedComponent.model.items;

        if (items instanceof Array) {
          evaluatedComponent.model.items = items.filter((item) =>
            item.condition
              ? this.model.conditions[item.condition].fn(relevantState)
              : true
          );
        }

        return evaluatedComponent;
      });

      /**
       * used for when a user clicks the "back" link. Progress is stored in the state. This is a safer alternative to running javascript that pops the history `onclick`.
       */
      const lastVisited = progress[progress.length - 1];
      if (!lastVisited || !lastVisited.startsWith(currentPath)) {
        if (progress[progress.length - 2] === currentPath) {
          progress.pop();
        } else {
          progress.push(currentPath);
        }
      }

      await cacheService.mergeState(request, { progress });
      viewModel.backLink = progress[progress.length - 2];
      return h.view(this.viewName, viewModel);
    };
  }

  /**
   * Returns an async function. This is called in plugin.ts when there is a POST request at `/{id}/{path*}`
   */
  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { cacheService } = request.services([]);
      const hasFilesizeError = request.payload === null;
      const preHandlerErrors = request.pre.errors;
      const payload = (request.payload || {}) as FormData;
      const formResult: any = this.validateForm(payload);
      const state = await cacheService.getState(request);
      const originalFilenames = (state || {}).originalFilenames || {};
      const fileFields = this.getViewModel(formResult)
        .components.filter((component) => component.type === "FileUploadField")
        .map((component) => component.model);
      const progress = state.progress || [];
      const { num } = request.query;

      // TODO:- Refactor this into a validation method
      if (hasFilesizeError) {
        const reformattedErrors = fileFields.map((field) => {
          return {
            path: field.name,
            href: `#${field.name}`,
            name: field.name,
            text: "The selected file must be smaller than 5MB",
          };
        });

        formResult.errors = Object.is(formResult.errors, null)
          ? { titleText: "Fix the following errors" }
          : formResult.errors;
        formResult.errors.errorList = reformattedErrors;
      }

      /**
       * other file related errors.. assuming file fields will be on their own page. This will replace all other errors from the page if not..
       */
      if (preHandlerErrors) {
        const reformattedErrors: any[] = [];
        preHandlerErrors.forEach((error) => {
          const reformatted = error;
          const fieldMeta = fileFields.find((field) => field.id === error.name);

          if (typeof reformatted.text === "string") {
            /**
             * if it's not a string it's probably going to be a stack trace.. don't want to show that to the user. A problem for another day.
             */
            reformatted.text = reformatted.text.replace(
              /%s/,
              fieldMeta?.label?.text.trim() ?? "the file"
            );
            reformattedErrors.push(reformatted);
          }
        });

        formResult.errors = Object.is(formResult.errors, null)
          ? { titleText: "Fix the following errors" }
          : formResult.errors;
        formResult.errors.errorList = reformattedErrors;
      }

      Object.entries(payload).forEach(([key, value]) => {
        if (value && value === (originalFilenames[key] || {}).location) {
          payload[key] = originalFilenames[key].originalFilename;
        }
      });

      /**
       * If there are any errors, render the page with the parsed errors
       */
      if (formResult.errors) {
        const viewModel = this.getViewModel(payload, num, formResult.errors);
        viewModel.backLink = progress[progress.length - 2];
        this.setFeedbackDetails(viewModel, request);
        return h.view(this.viewName, viewModel);
      }

      const newState = this.getStateFromValidForm(formResult.value);
      const stateResult = this.validateState(newState);

      if (stateResult.errors) {
        const viewModel = this.getViewModel(payload, num, stateResult.errors);
        viewModel.backLink = progress[progress.length - 2];
        this.setFeedbackDetails(viewModel, request);
        return h.view(this.viewName, viewModel);
      }

      let update = this.getPartialMergeState(stateResult.value);
      if (this.repeatField) {
        const updateValue = { [this.path]: update[this.section.name] };
        const sectionState = state[this.section.name];
        if (!sectionState) {
          update = { [this.section.name]: [updateValue] };
        } else if (!sectionState[num - 1]) {
          sectionState.push(updateValue);
          update = { [this.section.name]: sectionState };
        } else {
          sectionState[num - 1] = merge(
            sectionState[num - 1] ?? {},
            updateValue
          );
          update = { [this.section.name]: sectionState };
        }
      }
      const savedState = await cacheService.mergeState(
        request,
        update,
        !!this.repeatField
      );

      //Calculate our relevantState, which will filter out previously input answers that are no longer relevant to this user journey
      //This is required to ensure we don't navigate to an incorrect page based on stale state values
      let relevantState = this.getConditionEvaluationContext(
        this.model,
        savedState
      );

      return this.proceed(request, h, relevantState);
    };
  }

  setFeedbackDetails(viewModel, request) {
    const feedbackContextInfo = this.getFeedbackContextInfo(request);
    if (feedbackContextInfo) {
      viewModel.name = feedbackContextInfo.formTitle;
    }
    // setting the feedbackLink to undefined here for feedback forms prevents the feedback link from being shown
    if (this.def.feedback?.url) {
      viewModel.feedbackLink = this.feedbackUrlFromRequest(request);
    }
    if (this.def.feedback?.emailAddress) {
      viewModel.feedbackLink = `mailto:${this.def.feedback.emailAddress}`;
    }
  }

  getFeedbackContextInfo(request: HapiRequest) {
    if (this.def.feedback?.feedbackForm) {
      return decodeFeedbackContextInfo(
        request.url.searchParams.get(feedbackReturnInfoKey)
      );
    }
  }

  feedbackUrlFromRequest(request: HapiRequest): string | void {
    if (this.def.feedback?.url) {
      let feedbackLink = new RelativeUrl(this.def.feedback.url);
      const returnInfo = new FeedbackContextInfo(
        this.model.name,
        this.pageDef.title,
        `${request.url.pathname}${request.url.search}`
      );
      feedbackLink.setParam(feedbackReturnInfoKey, returnInfo.toString());
      return feedbackLink.toString();
    }
  }

  makeGetRoute() {
    return {
      method: "get",
      path: this.path,
      options: this.getRouteOptions,
      handler: this.makeGetRouteHandler(),
    };
  }

  makePostRoute() {
    return {
      method: "post",
      path: this.path,
      options: this.postRouteOptions,
      handler: this.makePostRouteHandler(),
    };
  }

  findPageByPath(path: string) {
    return this.model.pages.find((page) => page.path === path);
  }

  proceed(request: HapiRequest, h: HapiResponseToolkit, state) {
    return proceed(request, h, this.getNext(state));
  }

  getPartialMergeState(value) {
    return this.section ? { [this.section.name]: value } : value;
  }

  localisedString(description, lang: string) {
    let string;
    if (typeof description === "string") {
      string = description;
    } else {
      string = description[lang] ? description[lang] : description.en;
    }
    return string;
  }

  get viewName() {
    return "index";
  }

  get defaultNextPath() {
    return `${this.model.basePath || ""}/summary`;
  }

  get validationOptions() {
    return { abortEarly: false };
  }

  get conditionOptions() {
    return this.model.conditionOptions;
  }

  get errorSummaryTitle() {
    return "Fix the following errors";
  }

  /**
   * {@link https://hapi.dev/api/?v=20.1.2#route-options}
   */
  get getRouteOptions() {
    return {};
  }
  /**
   * {@link https://hapi.dev/api/?v=20.1.2#route-options}
   */
  get postRouteOptions() {
    return {};
  }

  get formSchema() {
    return this[FORM_SCHEMA];
  }

  set formSchema(value) {
    this[FORM_SCHEMA] = value;
  }

  get stateSchema() {
    return this[STATE_SCHEMA];
  }

  set stateSchema(value) {
    this[STATE_SCHEMA] = value;
  }

  private objLength(object: {}) {
    return Object.keys(object).length;
  }
}
