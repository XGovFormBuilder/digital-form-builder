import { merge, reach } from "@hapi/hoek";
import * as querystring from "querystring";
import { validationOptions } from "server/plugins/engine/pageControllers/validationOptions";

import {
  feedbackReturnInfoKey,
  getBackLink,
  getReturnUrl,
  handleFieldsetErrors,
  normalizeUrlPath,
  proceed,
  redirectTo,
} from "../helpers";
import { ComponentCollection } from "../components/ComponentCollection";
import {
  decodeFeedbackContextInfo,
  FeedbackContextInfo,
  RelativeUrl,
} from "../feedback";
import {
  HapiRequest,
  HapiResponseObject,
  HapiResponseToolkit,
} from "server/types";
import { FormModel } from "../models";
import {
  FormData,
  FormPayload,
  FormSubmissionErrors,
  FormSubmissionState,
} from "../types";
import { FormDefinition } from "@xgovformbuilder/model";
import { ComponentCollectionViewModel } from "../components/types";
import { format, parseISO } from "date-fns";
import config from "server/config";
import nunjucks from "nunjucks";
import Joi from "joi";
import Jwt from "@hapi/jwt";
import { verifyHmacToken } from "../../initialiseSession/helpers";
import { extractAddressContext } from "../utils/addressUtils";
import { ConditionalCase, resolveConditionalValue } from "../conditionalValue";

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
    phaseBanner?: {
      phase?: string;
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
  sectionForExitJourneySummaryPages: any;
  sectionForEndSummaryPages: any;
  sectionForMultiSummaryPages: any;
  sidebarContent: any;
  components: ComponentCollection;
  componentsAfter: ComponentCollection;
  disableSingleComponentAsHeading: boolean;
  hasFormComponents: boolean;
  hasConditionalFormComponents: boolean;
  backLinkFallback?: string;
  details?: any;
  disableBackLink?: boolean;
  returnUrl?: string;
  buttonText?: string;
  honorReturnURL?: boolean | ConditionalCase<boolean>[];
  hideContinueButton?: boolean;
  showContinueButton?: boolean;
  hasStartButton?: boolean;
  footerLinks: FormDefinition["footerLinks"];

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
    this.backLinkFallback = pageDef.backLinkFallback;
    this.disableBackLink = pageDef.disableBackLink;
    this.disableSingleComponentAsHeading =
      pageDef.disableSingleComponentAsHeading;
    this.buttonText =
      pageDef?.options?.customButtonText ?? this.defaultButtonText;
    this.honorReturnURL = pageDef?.options?.honorReturnURL ?? true;
    this.hasStartButton = pageDef?.options?.hasStartButton ?? false;
    this.footerLinks = def.footerLinks;

    // force show or hide the form button. They will only have an effect if they are not undefined.
    this.hideContinueButton = pageDef.options?.hideContinueButton;
    this.showContinueButton = pageDef.options?.showContinueButton;

    // Resolve section
    this.section = model.sections?.find(
      (section) => section.name === pageDef.section
    );
    this.sectionForExitJourneySummaryPages =
      pageDef.sectionForExitJourneySummaryPages;
    this.sectionForMultiSummaryPages = pageDef.sectionForMultiSummaryPages;
    this.sectionForEndSummaryPages = pageDef.sectionForEndSummaryPages;
    this.sidebarContent = pageDef.sidebarContent;

    // Components collection
    const components = new ComponentCollection(pageDef.components, model);
    const conditionalFormComponents = components.formItems.filter(
      (c: any) => c.conditionalComponents
    );

    const fieldsForPrePopulation = components.prePopulatedItems;

    if (this.section) {
      this.model.fieldsForPrePopulation[this.section.name] = {
        ...(this.model.fieldsForPrePopulation[this.section.name] ?? {}),
        ...fieldsForPrePopulation,
      };
    } else {
      this.model.fieldsForPrePopulation = {
        ...this.model.fieldsForPrePopulation,
        ...fieldsForPrePopulation,
      };
    }

    this.components = components;
    this.hasFormComponents = !!components.formItems.length;
    this.hasConditionalFormComponents = !!conditionalFormComponents.length;

    this.componentsAfter = new ComponentCollection(
      pageDef.componentsAfter ?? [],
      model
    );

    this[FORM_SCHEMA] = this.components.formSchema;
    this[STATE_SCHEMA] = this.components.stateSchema;

    if (this.model.allowExit) {
      this[FORM_SCHEMA] = this[FORM_SCHEMA].append({
        action: Joi.string().allow("exit"),
      });
      this[STATE_SCHEMA] = this[STATE_SCHEMA].append({
        action: Joi.string().allow("exit"),
      });
    }
  }

  /**
   * This method is called at the start of the getRouteHandler function. It can be overridden to retrieve state
   * @param _request the http request object
   */
  async onMakeGetRouteHandler(_request: HapiRequest) {}

  /**
   * Magic link forms (e.g. magic-link, kls-magic-link) are a sub-journey rather than a linear form: /start only
   * redirects (so never records progress), and users re-enter from the emailed link via /return, often in a new session.
   */
  isMagicLinkForm(): boolean {
    return (
      this.model.startPage?.pageDef?.controller ===
      "MagicLinkStartPageController"
    );
  }

  /**
   * The start page redirect assumes progress is recorded from the start page onwards. Magic link forms break that
   * assumption: redirecting would loop between /email and /start, and send users arriving from the emailed link to /email
   * instead of /expired or /incorrect-email.
   */
  skipStartPageRedirect(): boolean {
    return this.isMagicLinkForm();
  }

  /**
   * Used for mapping FormData and errors to govuk-frontend's template api, so a page can be rendered
   * @param formData - contains a user's form payload, and any validation errors that may have occurred
   */
  getViewModel(
    formData: FormData,
    iteration?: unknown,
    errors?: FormSubmissionErrors
  ): {
    page: PageControllerBase;
    name: string;
    pageTitle: string;
    sectionTitle: string;
    showTitle: boolean;
    components: ComponentCollectionViewModel;
    componentsAfter: ComponentCollectionViewModel;
    errors?: FormSubmissionErrors;
    isStartPage: boolean;
    startPage?: HapiResponseObject;
    backLink?: string;
    phaseTag?: string | undefined;
    details?: any;
    returnUrl?: string | undefined;
    allowExit?: boolean;
    footerLinks?: FormDefinition["footerLinks"];
  } {
    let showTitle = true;
    let pageTitle = this.title;
    if (config.allowUserTemplates) {
      pageTitle = nunjucks.renderString(pageTitle, {
        ...formData,
      });
    }
    let sectionTitle = !this.section?.hideTitle && this.section?.title;
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
      if (!this.disableSingleComponentAsHeading) {
        if (pageTitle) {
          label.text = pageTitle;
        }

        label.isPageHeading = true;
        label.classes = "govuk-fieldset__legend--l";

        if (singleFormComponent.model?.fieldset) {
          singleFormComponent.model.fieldset.legend = label;
        }

        pageTitle = pageTitle || label.text;
        showTitle = false;
      }
    }

    return {
      page: this,
      name: this.name,
      pageTitle,
      sectionTitle,
      showTitle,
      components,
      componentsAfter: this.componentsAfter.getViewModel(formData, errors),
      errors,
      isStartPage: false,
      details: this.details || undefined,
      returnUrl: this.returnUrl || undefined,
    };
  }

  /**
   * utility function that checks if this page has any items in the {@link Page.next} object.
   */
  get hasNext() {
    return Array.isArray(this.pageDef.next) && this.pageDef.next.length > 0;
  }

  get defaultButtonText() {
    return "Continue";
  }

  get next() {
    const pageDefNext = this.pageDef.next ?? [];

    return pageDefNext
      .map((next: { path: string; redirect?: string }) => {
        const { path } = next;

        if (next?.redirect) {
          return next;
        }

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
    const conditionResults: { condition: string; passed: boolean }[] = [];
    const nextLink = this.next.find((link) => {
      const { condition } = link;

      if (!condition) {
        defaultLink = link;
        return false;
      }

      const conditionPassed = this.model.conditions[condition]?.fn?.(state);

      conditionResults.push({ condition, passed: !!conditionPassed });

      if (conditionPassed) return link;

      return false;
    });

    if (nextLink?.redirect) {
      return nextLink;
    }

    return nextLink?.page ?? defaultLink?.page;
  }

  // TODO: type
  /**
   * returns the path to the next page
   */
  getNext(state: any) {
    const nextPage = this.getNextPage(state);
    if (nextPage?.redirect) {
      return nextPage.redirect;
    }
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

      return {
        ...this.components.getFormDataFromState(
          newState as FormSubmissionState
        ),
        ...this.model.fieldsForContext?.getFormDataFromState(
          newState as FormSubmissionState
        ),
      };
    }

    return {
      ...this.components.getFormDataFromState(pageState || {}),
      ...this.model.getContextState(state),
      ...extractAddressContext(state),
    };
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
      const isoRegex =
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

      const errorList = validationResult.error.details.map((err) => {
        const name = err.path
          .map((name: string, index: number) =>
            index > 0 ? `__${name}` : name
          )
          .join("");

        return {
          path: err.path.join("."),
          href: `#${name}`,
          name: name,
          text: err.message.replace(isoRegex, (text) => {
            return format(parseISO(text), "d MMMM yyyy");
          }),
        };
      });

      return {
        titleText: this.errorSummaryTitle,
        errorList: errorList.filter(
          ({ text }, index) =>
            index === errorList.findIndex((err) => err.text === text)
        ),
      };
    }

    return undefined;
  }

  /**
   * Runs {@link joi.validate}
   * @param value - user's answers
   * @param schema - which schema to validate against
   */
  validate<T = unknown>(value, schema) {
    const result = schema.validate(value, this.validationOptions);
    const errors = result.error ? this.getErrors(result) : null;

    return { value: result.value as T, errors };
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

    //While the current page isn't null
    const checkedPages = new Set<PageControllerBase>();
    while (nextPage != null) {
      //Either get the current state or the current state of the section if this page belongs to a section
      const currentState =
        (nextPage.section ? state[nextPage.section.name] : state) ?? {};
      let newValue = {};

      //Iterate all components on this page and pull out the saved values from the state
      for (const component of nextPage.components.items) {
        newValue[component.name] = currentState[component.name];

        if (component.options.conditionallyRevealedComponents) {
          for (const key in component.options.conditionallyRevealedComponents) {
            const revealedComponent =
              component.options.conditionallyRevealedComponents[key]; // Get the actual object
            newValue[revealedComponent.name] =
              currentState[revealedComponent.name];
          }
        }
      }

      if (nextPage.section) {
        newValue = { [nextPage.section.name]: newValue };
      }

      //Combine our stored values with the existing relevantState that we've been building up
      relevantState = merge(relevantState, newValue);

      //By passing our current relevantState to getNextPage, we will check if we can navigate to this next page (including doing any condition checks if applicable)
      const possibleNextPage = nextPage.getNextPage(relevantState);
      if (possibleNextPage?.redirect) {
        nextPage = null;
      } else {
        nextPage = possibleNextPage;
      }

      //If a nextPage is returned, we must have taken that route through the form so continue our iteration with the new page
      if (checkedPages.has(nextPage)) {
        nextPage = null;
      } else {
        checkedPages.add(nextPage);
      }
    }

    return relevantState;
  }

  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      await this.onMakeGetRouteHandler(request);

      const { cacheService } = request.services([]);
      const lang = this.langFromRequest(request);
      const state = await cacheService.getState(request);
      const progress = state.progress || [];
      const { num } = request.query;
      const currentPath = `/${this.model.basePath}${this.path}${request.url.search}`;
      const startPage = this.model.def.startPage;
      const formData = this.getFormDataFromState(state, num - 1);

      const isStartPage = this.path === `${startPage}`;
      const isInitialisedSession = !!state.callback;
      const shouldRedirectToStartPage =
        !this.model.options.previewMode &&
        !this.skipStartPageRedirect() &&
        progress.length === 0 &&
        !request.pre.hasPrepopulatedSessionFromQueryParameter &&
        !isStartPage &&
        !isInitialisedSession;

      if (shouldRedirectToStartPage) {
        // @ts-ignore
        return startPage!.startsWith("http")
          ? redirectTo(request, h, startPage!)
          : redirectTo(request, h, `/${this.model.basePath}${startPage!}`);
      }

      if (
        this.model.def.authentication &&
        this.model.def.toggle === true &&
        this.pageDef.unauthenticated !== true
      ) {
        const authCookie = request.state.auth_token; // Check for the auth cookie

        if (!authCookie && !isStartPage && this.model.def.authentication) {
          // If the auth cookie is missing and it's not the start page, redirect
          if (currentPath !== `/${this.model.basePath}${startPage!}`) {
            return h.redirect(`/${this.model.basePath}${startPage!}`);
          }
        }
        if (authCookie) {
          const tokenArtifacts = Jwt.token.decode(authCookie);
          const { isValid } = verifyHmacToken(
            tokenArtifacts,
            this.model.def.jwtKey
          );

          if (!isValid) {
            // If the token is invalid, redirect to the start page
            if (currentPath !== `/${this.model.basePath}${startPage!}`) {
              return h.redirect(`/${this.model.basePath}${startPage!}`);
            }
          }
        }
      }

      formData.lang = lang;
      formData.returnUrl = getReturnUrl(request);
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

      this.setPhaseTag(viewModel);
      this.setFeedbackDetails(viewModel, request);
      this.setFooterLinks(viewModel);

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

      viewModel.componentsAfter = viewModel.componentsAfter.filter(
        (component) => {
          if (
            (component.model.content || component.type === "Details") &&
            component.model.condition
          ) {
            const condition = this.model.conditions[component.model.condition];

            return condition.fn(relevantState);
          }

          return true;
        }
      );

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
       *
       * If we're revisiting a page already further down the stack (e.g. returning to
       * a summary page after a multi-hop detour like an address lookup or a
       * change-link sub-journey), truncate back to that point rather than pushing a
       * duplicate - otherwise the detour pages linger forever and the back link
       * cycles through stale pages instead of leaving the loop.
       */
      const normalizedProgress = progress.map(normalizeUrlPath);
      const normalizedCurrentPath = normalizeUrlPath(currentPath);
      const lastVisited = normalizedProgress[normalizedProgress.length - 1];

      if (!lastVisited || lastVisited !== normalizedCurrentPath) {
        const priorIndex = normalizedProgress.lastIndexOf(
          normalizedCurrentPath
        );

        if (priorIndex !== -1) {
          normalizedProgress.length = priorIndex + 1;
        } else {
          normalizedProgress.push(normalizedCurrentPath);
        }
      }

      await cacheService.mergeState(request, {
        progress: normalizedProgress,
        ...(this.model.def.provider && {
          paymentProvider: this.model.def.provider,
        }),
      });

      if (this.disableBackLink) {
        viewModel.backLink = undefined;
      } else {
        viewModel.backLink = getBackLink(
          request,
          normalizedProgress,
          this.backLinkFallback
        );
      }

      viewModel.allowExit = this.model.allowExit;

      return h.view(this.viewName, viewModel);
    };
  }

  /**
   * deals with parsing errors and saving answers to state
   */
  async handlePostRequest(
    request: HapiRequest,
    h: HapiResponseToolkit,
    mergeOptions: {
      nullOverride?: boolean;
      arrayMerge?: boolean;
      /**
       * if you wish to modify the value just before it is added to the user's session (i.e. after validation and error parsing), use the modifyUpdate method.
       * pass in a function, that takes in the update value. Make sure that this returns the modified value.
       */
      modifyUpdate?: <T>(value: T) => any;
    } = {}
  ) {
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
    const fieldsetFields = this.components.items.filter(
      (component) => "type" in component && component.type === "Fieldset"
    );
    const progress = state.progress || [];
    const { num } = request.query;
    const formData = this.getFormDataFromState(state, num - 1);
    const combined = { ...formData, ...payload } as FormData;
    combined.returnUrl = getReturnUrl(request);

    // TODO:- Refactor this into a validation method
    if (hasFilesizeError) {
      const reformattedErrors = fileFields.map((field) => {
        return {
          path: field.name,
          href: `#${field.name}`,
          name: field.name,
          text: `The selected files must be smaller than ${config.maxFileSizeStringInMb}MB`,
        };
      });

      formResult.errors = Object.is(formResult.errors, null)
        ? { titleText: "There is a problem" }
        : formResult.errors;

      formResult.errors.errorList = reformattedErrors;
    }

    if (fieldsetFields.length && formResult.errors) {
      handleFieldsetErrors(formResult.errors, fieldsetFields);
    }
    /**
     * other file related errors.. assuming file fields will be on their own page. This will replace all other errors from the page if not..
     */
    if (preHandlerErrors?.length) {
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
        ? { titleText: "There is a problem" }
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
      //TODO:- refactor to match POST REDIRECT GET pattern.
      return this.renderWithErrors(
        request,
        h,
        combined,
        num,
        progress,
        formResult.errors
      );
    }

    const newState = this.getStateFromValidForm(formResult.value);
    const stateResult = this.validateState(newState);

    if (stateResult.errors) {
      return this.renderWithErrors(
        request,
        h,
        combined,
        num,
        progress,
        stateResult.errors
      );
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
        sectionState[num - 1] = merge(sectionState[num - 1] ?? {}, updateValue);
        update = { [this.section.name]: sectionState };
      }
    }

    const { nullOverride, arrayMerge, modifyUpdate } = mergeOptions;

    if (modifyUpdate) {
      update = modifyUpdate(update);
    }

    await cacheService.mergeState(request, update, nullOverride, arrayMerge);
  }

  /**
   * Returns an async function. This is called in plugin.ts when there is a POST request at `/{id}/{path*}`
   */
  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const response = await this.handlePostRequest(request, h);

      if (response?.source?.context?.errors) {
        return response;
      }

      const { cacheService } = request.services([]);

      if (
        this.model.def.authentication &&
        this.model.def.toggle === true &&
        this.pageDef.unauthenticated !== true
      ) {
        const startPage = this.model.def.startPage;
        const isStartPage = this.path === `${startPage}`;
        const currentPath = `/${this.model.basePath}${this.path}${request.url.search}`;
        const authCookie = request.state.auth_token; // Check for the auth cookie
        if (!authCookie && !isStartPage) {
          // If the auth cookie is missing and it's not the start page, redirect
          if (currentPath !== `/${this.model.basePath}${startPage!}`) {
            return h.redirect(`/${this.model.basePath}${startPage!}`);
          }
        }

        if (authCookie) {
          const tokenArtifacts = Jwt.token.decode(authCookie);

          const { isValid } = verifyHmacToken(
            tokenArtifacts,
            this.model.def.jwtKey
          );

          if (!isValid) {
            // If the token is invalid, redirect to the start page
            if (currentPath !== `/${this.model.basePath}${startPage!}`) {
              return h.redirect(`/${this.model.basePath}${startPage!}`);
            }
          }
        }
      }

      const shouldGoToExitPage =
        this.model.allowExit &&
        (request.payload as { action?: string })?.action === "exit";

      if (shouldGoToExitPage) {
        await cacheService.setExitState(request, {
          pageExitedOn: request.path,
        });
        return h.redirect("exit/email");
      }
      const savedState = await cacheService.getState(request);
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
    const feedbackUrl = this.model.def.feedback?.url;
    if (feedbackUrl) {
      if (feedbackUrl.startsWith("http")) {
        return feedbackUrl;
      }

      const relativeFeedbackUrl = new RelativeUrl(feedbackUrl);
      const returnInfo = new FeedbackContextInfo(
        this.model.name,
        this.pageDef.title,
        `${request.url.pathname}${request.url.search}`
      );
      relativeFeedbackUrl.setParam(
        feedbackReturnInfoKey,
        returnInfo.toString()
      );
      return relativeFeedbackUrl.toString();
    }

    return undefined;
  }

  setFooterLinks(viewModel) {
    viewModel.footerLinks = this.footerLinks;
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

  /**
   * Navigates to the next page after a successful form submission.
   *
   * @param request - The incoming Hapi request.
   * @param h - The Hapi response toolkit used to issue the redirect.
   * @param state - Current form submission state, used to determine the next page.
   * @param honourReturnUrl - Override whether the `returnUrl` query param is
   *   respected. Defaults to `true` when the next path matches the return URL.
   */
  proceed(
    request: HapiRequest,
    h: HapiResponseToolkit,
    state,
    honourReturnUrl?: boolean
  ) {
    const nextPage = this.getNext(state);
    const nextUrl = nextPage?.redirect ?? nextPage;

    const returnUrl = getReturnUrl(request);

    const resolvedHonorReturnURL = resolveConditionalValue(
      this.honorReturnURL,
      state,
      this.model.conditions,
      true
    );

    const shouldHonourReturnUrl =
      honourReturnUrl ?? resolvedHonorReturnURL ?? returnUrl !== undefined;

    return proceed(request, h, nextUrl, shouldHonourReturnUrl);
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
    return `/${this.model.basePath || ""}/summary`;
  }

  get validationOptions() {
    return validationOptions;
  }

  get conditionOptions() {
    return this.model.conditionOptions;
  }

  get errorSummaryTitle() {
    return "There is a problem";
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

  private setPhaseTag(viewModel) {
    // Set phase tag if it exists in form definition (even if empty for 'None'),
    // otherwise the template context will simply return server config
    if (this.def.phaseBanner) {
      viewModel.phaseTag = this.def.phaseBanner.phase;
    }
  }

  private renderWithErrors(request, h, payload, num, progress, errors) {
    const viewModel = this.getViewModel(payload, num, errors);

    if (this.disableBackLink) {
      viewModel.backLink = undefined;
    } else {
      viewModel.backLink = getBackLink(
        request,
        progress,
        this.backLinkFallback
      );
    }

    this.setPhaseTag(viewModel);
    this.setFeedbackDetails(viewModel, request);
    viewModel.allowExit = this.model.allowExit;
    return h.view(this.viewName, viewModel);
  }
}

export type PageViewModel = ReturnType<PageControllerBase["getViewModel"]>;
