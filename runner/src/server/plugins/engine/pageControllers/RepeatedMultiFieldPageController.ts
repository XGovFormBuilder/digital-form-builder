import { HapiRequest, HapiResponseToolkit } from "server/types";
import { PageController } from "./PageController";
import { FormModel } from "server/plugins/engine/models";
import { ComponentDef, RepeatingMultiFieldPage } from "@xgovformbuilder/model";
import { FormComponent } from "../components";
import { FormSubmissionState } from "server/plugins/engine/types";
import nunjucks from "nunjucks";
import { SummaryCard } from "../models/types";

import joi from "joi";
import { reach, clone } from "hoek";

import type { SummaryDetailsTransformationMap } from "server/transforms/summaryDetails/types";

const summaryDetailsTransformations: SummaryDetailsTransformationMap = require("../../../transforms/summaryDetails");

const contentTypes: Array<ComponentDef["type"]> = [
  "Para",
  "Details",
  "Html",
  "InsetText",
];

function isInputType(component) {
  return !contentTypes.includes(component.type);
}

const DEFAULT_OPTIONS = {
  summaryDisplayMode: {
    samePage: false,
  },
  customText: {},
};

export class RepeatedMultiFieldPageController extends PageController {
  inputComponents!: FormComponent[];
  isRepeatingFieldPageController = true;
  sectionKey: string;

  options: RepeatingMultiFieldPage["options"];

  constructor(model: FormModel, pageDef: RepeatingMultiFieldPage) {
    super(model, pageDef);
    this.sectionKey = pageDef.options?.sectionKey;

    if (!this.sectionKey) {
      throw Error(
        "RepeatedMultiFieldPage initialisation failed, no section key was found"
      );
    }
    if (this.section && this.section.name === this.sectionKey) {
      throw Error(
        `RepeatedMultiFieldPage at "${pageDef.path}": section name "${this.section.name}" ` +
          `must not equal sectionKey "${this.sectionKey}". Use distinct strings in the form definition.`
      );
    }

    const providedOptions = pageDef?.options ?? {};
    this.options = {
      ...DEFAULT_OPTIONS,
      ...providedOptions,
      summaryDisplayMode: {
        ...DEFAULT_OPTIONS.summaryDisplayMode,
        ...providedOptions.summaryDisplayMode,
      },
      customText: {
        ...DEFAULT_OPTIONS.customText,
        ...providedOptions.customText,
      },
    };

    const allInputs = (this.components?.items ?? []).filter(isInputType);
    if (allInputs.length === 0) {
      throw Error(
        "RepeatingSectionPageController: no input components found on page"
      );
    }
    this.inputComponents = allInputs as FormComponent[];
  }

  get stateSchema() {
    const componentNames = this.inputComponents.map((c) => c.name);

    const itemSchema = joi.object(
      this.inputComponents.reduce<Record<string, joi.Schema>>((acc, comp) => {
        acc[comp.name] = comp.getStateSchemaKeys()[comp.name] ?? joi.any();
        return acc;
      }, {})
    );

    return super.stateSchema
      .fork(componentNames, (schema) => schema.optional())
      .keys({
        [this.sectionKey]: joi
          .array()
          .items(itemSchema)
          .single()
          .empty(null)
          .default([]),
      });
  }

  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { query } = request;
      const { removeAtIndex, remove, view } = query;

      if (removeAtIndex !== undefined || remove !== undefined) {
        return this.removeAtIndex(request, h);
      }

      // Editing an existing entry: ?view=N
      // Checked BEFORE the summary branch so a link carrying returnUrl
      // (e.g. from the main summary page) still routes to the edit view
      // instead of being hijacked into the repeat summary list.
      const isPastView =
        view !== undefined && view !== "" && !isNaN(Number(view));

      if (isPastView) {
        const response = await super.makeGetRouteHandler()(request, h);
        const { cacheService } = request.services([]);
        const state = await cacheService.getState(request);
        const entry = this.getPartialState(state, view) ?? {};

        // Get existing values
        const formData = this.components.getFormDataFromState(entry);
        const freshModels = this.components.getViewModel(formData);

        // Swap only the model onto the components the base handler already built
        const context = response.source?.context;
        if (context?.components) {
          context.components = context.components.map((component) => {
            const name = component.model?.name;
            if (!name) return component;

            const fresh = freshModels.find((c) => c.model?.name === name);
            return fresh ? { ...component, model: fresh.model } : component;
          });
        }

        return response;
      }

      // Summary view scenario: explicit ?view=summary only.
      // returnUrl which leads to main form summary
      if (view === "summary") {
        const { cacheService } = request.services([]);
        const state = await cacheService.getState(request);

        const { progress = [] } = state;
        progress.push(`/${this.model.basePath}${this.path}?view=summary`);
        await cacheService.mergeState(request, { progress });

        return h.view(
          "repeating-multi-field-summary",
          this.getSummaryViewModel(state, request)
        );
      }

      // New entry scenario
      return super.makeGetRouteHandler()(request, h);
    };
  }
  async removeAtIndex(request, h) {
    const { query } = request;
    const { returnUrl } = query;
    const { cacheService } = request.services([]);
    const state = await cacheService.getState(request);

    const index = Number(query.removeAtIndex ?? query.remove);

    const current = this.getPartialState(state);
    const list = Array.isArray(current) ? [...current] : [];

    if (!Number.isNaN(index)) {
      list.splice(index, 1);
    }

    await cacheService.mergeState(
      request,
      this.buildEntriesMergePayload(list),
      true, // nullOverride
      false // arrayMerge off → replace the array wholesale, don't index-merge
    );

    if (list.length < 1) {
      return h.redirect(
        this.withReturnUrl(
          `/${this.model.basePath}${this.path}?view=0`,
          returnUrl
        )
      );
    }
    return h.redirect(
      this.withReturnUrl(
        `/${this.model.basePath}${this.path}?view=summary`,
        returnUrl
      )
    );
  }

  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { query } = request;
      const { cacheService } = request.services([]);

      // Summary-page POSTs: either add another entry or continue to the next page.
      if (query.view === "summary") {
        return this.handleSummaryPost(request, h);
      }

      let validated: Record<string, unknown> = {};
      const response = await this.handlePostRequest(request, h, {
        arrayMerge: false,
        // Work around that allows us to capture errors building on top of Page controller
        modifyUpdate: (update) => {
          validated =
            this.section && update[this.section.name]
              ? update[this.section.name]
              : update;
          return {};
        },
      });

      if (response?.source?.context?.errors) {
        return response;
      }

      // Valid path: add new entry to array
      const entry = this.inputComponents.reduce<Record<string, unknown>>(
        (acc, comp) => {
          if (comp.name in validated) {
            acc[comp.name] = validated[comp.name];
          }
          return acc;
        },
        {}
      );

      const state = await cacheService.getState(request);
      const current = this.getPartialState(state);
      const list = Array.isArray(current) ? [...current] : [];

      // Checking if edit or new entry
      const rawIndex = query.view;
      const editIndex =
        rawIndex !== undefined && rawIndex !== "" && !isNaN(Number(rawIndex))
          ? Number(rawIndex)
          : undefined;

      if (editIndex !== undefined && editIndex < list.length) {
        list[editIndex] = {
          ...(list[editIndex] as Record<string, unknown>),
          ...entry,
        };
      } else {
        list.push(entry);
      }

      await cacheService.mergeState(
        request,
        this.buildEntriesMergePayload(list)
      );

      await cacheService.mergeState(
        request,
        this.buildEntriesMergePayload(list)
      );

      // Goes back to main summary page if change is made form there
      const { returnUrl } = request.query;
      return h.redirect(
        returnUrl
          ? String(returnUrl)
          : `/${this.model.basePath}${this.path}?view=summary`
      );
    };
  }

  buildEntriesMergePayload(list: Array<Record<string, unknown>>) {
    const inner = { [this.sectionKey]: list };
    return this.section ? { [this.section.name]: inner } : inner;
  }

  private getSummaryViewModel(state: any, request: HapiRequest) {
    const baseViewModel = super.getViewModel(state);
    let details = this.toSummaryDetails(state, "repeat");

    // Replicates the behaviour of the standard summary view model.
    const transformDetails = summaryDetailsTransformations[this.model.basePath];
    if (transformDetails) {
      try {
        details = transformDetails(clone(details));
      } catch (err) {
        console.error(
          "Error applying summary details transformation:",
          err,
          "Original details:",
          details
        );
      }
    }

    const separatePageTitle = (this.options?.customText as any)
      ?.separatePageTitle;

    return {
      ...baseViewModel,
      pageTitle: separatePageTitle
        ? nunjucks.renderString(separatePageTitle, { ...state })
        : baseViewModel.pageTitle,
      customText: this.options.customText,
      summaryDisplayMode: this.options.summaryDisplayMode,
      details,
      returnUrl: request.query.returnUrl,
    };
  }

  private cardTitle(index: number): string {
    const tmpl = (this.options?.customText as any)?.cardTitle ?? "Item {index}";
    return tmpl.replace("{index}", String(index + 1));
  }

  getPartialState(state, atIndex?: number | string) {
    // Consider if base should be saved in constructor
    const base = this.section ? reach(state, this.section.name) : state;
    const partial: Array<Record<string, unknown>> =
      reach(base ?? {}, this.sectionKey) ?? [];

    if (atIndex !== undefined && atIndex !== null && atIndex !== "") {
      return partial[Number(atIndex)];
    }
    return partial;
  }

  nextIndex(state) {
    const partial = this.getPartialState(state);
    return partial.length;
  }

  private formatValue(comp: any, value: unknown): string {
    if (value === undefined || value === null || value === "") return "";

    // Selection fields store a value but display text — map it.
    const listText = comp.list?.items?.find(
      (i: any) => i.value === value
    )?.text;
    if (listText !== undefined) return listText;

    if (comp.dataType === "date" || comp.dataType === "monthYear") {
      const d = new Date(value as string);
      if (!isNaN(d.getTime())) {
        return comp.dataType === "monthYear"
          ? d.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
          : d.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
      }
    }

    // Composite components (e.g. ContactDetailsCollection) store an object.
    if (typeof value === "object") {
      return Object.values(value as Record<string, unknown>)
        .filter((v) => v !== undefined && v !== null && v !== "")
        .join(", ");
    }

    return String(value);
  }

  /**
   * Handles POSTs from the repeat summary page: either go to a new entry
   * or continue to the next page.
   */
  private async handleSummaryPost(
    request: HapiRequest,
    h: HapiResponseToolkit
  ) {
    const { cacheService } = request.services([]);
    const state = await cacheService.getState(request);
    const payload = (request.payload ?? {}) as {
      addAnother?: string;
    };

    const wantsAnother = this.resolveAddAnother(payload);

    const { returnUrl } = request.query;
    const url = `/${this.model.basePath}${this.path}?view=${this.nextIndex(
      state
    )}`;
    if (wantsAnother === undefined) {
      return this.renderSummaryWithError(state, h, request);
    }

    if (wantsAnother) {
      return h.redirect(this.withReturnUrl(url, returnUrl));
    }

    return h.redirect(this.withReturnUrl(this.getNext(payload), returnUrl));
  }

  private resolveAddAnother(payload: {
    addAnother?: string;
  }): boolean | undefined {
    if (payload.addAnother === "increment") return true;
    if (payload.addAnother === "continue") return false;
    // Returns undefined if a Yes/No question is configured but wasn't answered.
    return undefined;
  }

  private renderSummaryWithError(
    state: any,
    h: HapiResponseToolkit,
    request: HapiRequest
  ) {
    const errorMessage = "Select yes if you want to add another";
    return h.view("repeating-multi-field-summary", {
      ...this.getSummaryViewModel(state, request),
      errors: {
        titleText: "There is a problem",
        errorList: [
          {
            text: errorMessage,
            href: "#addAnother",
          },
        ],
      },
      addAnotherError: { text: errorMessage },
    });
  }

  toSummaryDetails(
    state: FormSubmissionState,
    summaryContext: "repeat" | "main" = "main"
  ): Array<SummaryCard> {
    const entries =
      (this.getPartialState(state) as Array<Record<string, unknown>>) ?? [];
    const hideFieldChangeLinks =
      summaryContext === "main"
        ? this.options.hideFieldChangeLinksOnMainSummary === true
        : this.options.hideFieldChangeLinksOnRepeatSummary === true;

    return entries.map((entry, index) => ({
      name: String(index), // delete link → ?remove={{ data.name }}
      title: this.cardTitle(index), // e.g. "Item 1"
      index,
      card: `?view=${index}`, // change link → href="{{ data.card }}"
      items: this.inputComponents.map((comp) => ({
        name: comp.name,
        label: (comp.title ?? comp.name) as string,
        value: this.formatValue(comp, entry[comp.name]),
        url: `/${this.model.basePath}${this.path}?view=${index}`,
        immutable: hideFieldChangeLinks,
      })),
    }));
  }

  private withReturnUrl(url: string, returnUrl?: unknown): string {
    // allows us to persist the with return url path when we make edits to this section coming form the main summary page
    if (
      typeof returnUrl !== "string" ||
      !returnUrl.startsWith("/") ||
      returnUrl.startsWith("//")
    ) {
      return url;
    }
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  toWebhookQuestions(state: FormSubmissionState) {
    const entries =
      (this.getPartialState(state) as Array<Record<string, unknown>>) ?? [];

    const pageTitle = this.title
      ? nunjucks.renderString(this.title.en ?? this.title, { ...state })
      : "";

    return [
      {
        category: this.section?.name,
        question: pageTitle,
        fields: [
          {
            key: this.sectionKey,
            title: pageTitle,
            type: "list",
            answer: entries,
          },
        ],
        index: 0,
      },
    ];
  }
}
