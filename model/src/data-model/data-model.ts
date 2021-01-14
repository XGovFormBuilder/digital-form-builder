import { valuesFrom, yesNoValues } from "../values";
import type { ComponentValues } from "../values";
import {
  ConditionsWrapper,
  ConditionWrapperValue,
  ConditionRawData,
} from "./conditions-wrapper";
import { InputWrapper } from "./input-wrapper";
import { ValuesWrapper } from "./values-wrapper";
import { clone, filter } from "../utils/helpers";
import { ComponentDef } from "../components/types";
import { Page, Section, List, Feedback, PhaseBanner } from "./types";

export type RawData = Pick<
  Data,
  "startPage" | "pages" | "lists" | "sections"
> & {
  name?: string;
  conditions?: ConditionRawData[];
  feedback?: Feedback;
  phaseBanner?: PhaseBanner;
};

export class Data {
  /**
   * TODO
   * FIXME: Ideally I'd have made this part of feedback-context-info.js and moved that inside model
   * That, however uses relative-url.js, which utilises a URL and the shims for that don't work
   */
  static FEEDBACK_CONTEXT_ITEMS = [
    {
      key: "feedbackContextInfo_formTitle",
      display: "Feedback source form name",
      get: (contextInfo: { formTitle: string }) => contextInfo.formTitle,
    },
    {
      key: "feedbackContextInfo_pageTitle",
      display: "Feedback source page title",
      get: (contextInfo: { pageTitle: string }) => contextInfo.pageTitle,
    },
    {
      key: "feedbackContextInfo_url",
      display: "Feedback source url",
      get: (contextInfo: { url: string }) => contextInfo.url,
    },
  ];

  #name: string = "";
  startPage: string = "";
  pages: Page[] = [];
  lists: List[] = [];
  sections: Section[] = [];
  phaseBanner?: PhaseBanner = {};
  #conditions: ConditionsWrapper[] = [];
  #feedback?: Feedback;

  constructor(rawData: RawData) {
    const rawDataClone =
      rawData instanceof Data ? rawData._exposePrivateFields() : { ...rawData };

    // protected properties
    this.#name = rawDataClone.name || "";
    this.#feedback = rawDataClone.feedback;
    this.#conditions = (rawDataClone.conditions || []).map(
      (conditionObj: ConditionRawData) => new ConditionsWrapper(conditionObj)
    );

    // discard already set properties
    const { name, conditions, feedback, ...otherProps } = rawDataClone;

    Object.assign(this, otherProps);
  }

  _listInputsFor(page: Page, input: ComponentDef): Array<InputWrapper> {
    const values = this.valuesFor(input)?.toStaticValues();
    return values
      ? values.items.flatMap(
          (listItem) =>
            listItem.children
              ?.filter((component) => component.name)
              ?.map(
                (component) =>
                  new InputWrapper(component, page, {
                    parentItemName: listItem.label,
                  })
              ) ?? []
        )
      : [];
  }

  allInputs(): Array<InputWrapper> {
    const inputs: Array<InputWrapper> = this.pages.flatMap((page) =>
      (page.components || [])
        .filter((component) => component.name)
        .flatMap((component) =>
          [new InputWrapper(component, page, {})].concat(
            this._listInputsFor(page, component)
          )
        )
    );

    if (this.feedbackForm) {
      const startPage = this.findPage(this.startPage);
      const options = { ignoreSection: true };

      Data.FEEDBACK_CONTEXT_ITEMS.forEach((it) => {
        inputs.push(
          new InputWrapper(
            {
              type: "TextField",
              title: it.display,
              name: it.key,
              hint: "",
              options: {},
              schema: {},
            },
            startPage,
            options
          )
        );
      });
    }

    const names = new Set();

    return inputs.filter((input: InputWrapper) => {
      const isPresent = !names.has(input.propertyPath);
      names.add(input.propertyPath);
      return isPresent;
    });
  }

  inputsAccessibleAt(path: string): Array<InputWrapper> {
    const precedingPages = this._allPathsLeadingTo(path);
    return this.allInputs().filter(
      (input) =>
        precedingPages.includes(input.page.path) || path === input.page.path
    );
  }

  findPage(path: string | undefined) {
    return this.getPages().find((page) => page?.path === path);
  }

  findList(listName: string) {
    return this.lists.find((list) => list.name === listName);
  }

  addList(list: List) {
    this.lists.push(list);
  }

  addLink(from: string, to: string, condition: string): Data {
    const fromPage = this.pages.find((page) => page.path === from);
    const toPage = this.pages.find((page) => page.path === to);

    if (fromPage && toPage) {
      const existingLink = fromPage.next?.find(
        (page: { path: string }) => page.path === to
      );

      if (!existingLink) {
        const link: { path: string; condition?: string } = {
          path: to,
        };

        if (condition) {
          link.condition = condition;
        }

        fromPage.next = fromPage.next || [];
        fromPage.next.push(link);
      }
    }
    return this;
  }

  addSection(name: string, title: string): Data {
    if (!this.sections.find((section) => section.name === name)) {
      this.sections.push({ name, title });
    }
    return this;
  }

  updateLink(from: string, to: string, condition: string): Data {
    const fromPage = this.findPage(from);
    const toPage = this.pages.find((page) => page.path === to);

    if (fromPage && toPage) {
      const existingLink = fromPage.next?.find((page) => page.path === to);
      if (existingLink) {
        if (condition) {
          existingLink.condition = condition;
        } else {
          delete existingLink.condition;
        }
      }
    }
    return this;
  }

  updateLinksTo = (oldPath: string, newPath: string) => {
    this.pages
      .filter((page) => page.next?.find((link) => link.path === oldPath))
      .forEach((page) => {
        const pageLink = page.next?.find((link) => link.path === oldPath);

        if (pageLink) {
          pageLink.path = newPath;
        }
      });
    return this;
  };

  addPage(page: Page): Data {
    this.pages.push(page);
    return this;
  }

  getPages(): Array<any> {
    return this.pages;
  }

  valuesFor(component: ComponentDef): ValuesWrapper | undefined {
    const values = this._valuesFor(component);
    if (values) {
      return new ValuesWrapper(values, this);
    }
    return undefined;
  }

  _valuesFor(
    component: ComponentDef & { values?: ComponentValues }
  ): ComponentValues | null {
    if (component.type === "YesNoField") {
      return yesNoValues;
    }

    if (component.values) {
      return valuesFrom(component.values);
    }

    return null;
  }

  _allPathsLeadingTo(path: string): Array<string> {
    return this.pages
      .filter(
        (page) => page.next && page.next.find((next) => next.path === path)
      )
      .flatMap((page) =>
        [page.path].concat(this._allPathsLeadingTo(page.path))
      );
  }

  addCondition(
    name: string,
    displayName: string,
    value: ConditionWrapperValue
  ): Data {
    this.#conditions = this.#conditions;

    if (this.#conditions.find((condition) => condition.name === name)) {
      throw Error(`A condition already exists with name ${name}`);
    }

    this.#conditions.push(new ConditionsWrapper({ name, displayName, value }));
    return this;
  }

  addComponent(pagePath: string, component: ComponentDef): Data {
    const page = this.findPage(pagePath);
    if (page) {
      page.components = page.components || [];
      page.components.push(component);
    } else {
      throw Error(`No page exists with path ${pagePath}`);
    }
    return this;
  }

  updateComponent(
    pagePath: string,
    componentName: string,
    component: ComponentDef
  ): Data {
    const page = this.findPage(pagePath);

    if (page) {
      page.components = page.components || [];

      const index = page.components.findIndex(
        (component: ComponentDef) => component.name === componentName
      );

      if (index < 0) {
        throw Error(
          `No component exists with name ${componentName} with in page with path ${pagePath}`
        );
      }

      page.components[index] = component;
    } else {
      throw Error(`No page exists with path ${pagePath}`);
    }

    return this;
  }

  updateCondition(name: string, displayName: string, value): Data {
    const condition = this.#conditions.find(
      (condition) => condition.name === name
    );

    if (condition) {
      condition.displayName = displayName;
      condition.value = value;
    }
    return this;
  }

  removeCondition(name: string): Data {
    const condition = this.findCondition(name);
    if (condition) {
      this.#conditions.splice(
        this.#conditions.findIndex((condition) => condition.name === name),
        1
      );
      // Update any references to the condition
      this.getPages().forEach((page) => {
        Array.isArray(page.next) &&
          page.next.forEach((n) => {
            if (n.if === name) {
              delete n.if;
            }
          });
      });
    }
    return this;
  }

  findCondition(name: string): ConditionsWrapper | undefined {
    return this.#conditions.find((condition) => condition.name === name);
  }

  get hasConditions(): boolean {
    return this.#conditions.length > 0;
  }

  get conditions(): Array<ConditionsWrapper> {
    return this.#conditions.map((condition: ConditionsWrapper) =>
      clone(condition)
    );
  }

  get name(): string {
    return this.#name;
  }

  set name(name: string) {
    if (typeof name === "string" || name === undefined) {
      this.#name = name;
    } else {
      throw Error("name must be a string");
    }
  }

  get feedbackForm(): boolean {
    return this.#feedback?.feedbackForm ?? false;
  }

  set feedbackForm(feedbackForm: boolean) {
    if (typeof feedbackForm === "boolean") {
      this.#feedback = this.#feedback || {};
      this.#feedback.feedbackForm = feedbackForm;
    } else {
      throw Error("feedbackForm must be a boolean");
    }
  }

  setFeedbackUrl(feedbackUrl: string) {
    if (feedbackUrl && this.feedbackForm) {
      throw Error("Cannot set a feedback url on a feedback form");
    }
    if (typeof feedbackUrl === "string" || feedbackUrl === undefined) {
      this.#feedback = this.#feedback || {};
      this.#feedback.url = feedbackUrl;
    } else {
      throw Error("feedbackUrl must be a string");
    }
  }

  get feedbackUrl(): string | undefined {
    return this.#feedback?.url;
  }

  clone() {
    return new Data(this._exposePrivateFields());
  }

  toJSON() {
    const withoutFunctions = filter(
      this._exposePrivateFields(),
      (field) => typeof field !== "function"
    );
    return Object.assign({}, withoutFunctions);
  }

  _exposePrivateFields() {
    return Object.assign({}, this, {
      name: this.name,
      feedback: this.#feedback,
      conditions: this.#conditions.map((condition) => clone(condition)),
    });
  }
}
