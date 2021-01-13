import { StaticValues, valuesFrom, yesNoValues } from "./values";
import type { ComponentValues } from "./values";
import type { DataModel } from "./data-model-interface";
import { clone } from "./helpers";
import { ConditionsModel } from "./conditions";

class Input {
  name: string | undefined = undefined;
  title: string | undefined = undefined;
  propertyPath: string | undefined;
  page;
  #parentItemName: string;

  constructor(rawData, page, options) {
    Object.assign(this, rawData);
    const myPage = clone(page);
    delete myPage.components;
    this.page = myPage;
    this.propertyPath =
      !options.ignoreSection && page.section
        ? `${page.section}.${this.name}`
        : this.name;
    this.#parentItemName = options.parentItemName;
  }

  get displayName(): string | undefined {
    const titleWithContext = this.#parentItemName
      ? `${this.title} under ${this.#parentItemName}`
      : this.title;
    return this.page.section
      ? `${titleWithContext} in ${this.page.section}`
      : titleWithContext;
  }
}

export class Condition {
  name: string | undefined;
  displayName: string;
  value = undefined;

  constructor(rawData) {
    Object.assign(this, rawData);
    this.displayName = rawData.displayName || rawData.name;
  }

  get expression() {
    if (typeof this.value === "string") {
      return this.value;
    } else {
      // @ts-ignore
      return ConditionsModel.from(this.value).toExpression();
    }
  }

  clone(): Condition {
    return new Condition(this);
  }
}

class ValuesWrapper {
  values: ComponentValues;
  data: DataModel;

  constructor(values: ComponentValues, data: DataModel) {
    this.values = values;
    this.data = data;
  }

  toStaticValues(): StaticValues {
    // @ts-ignore
    return this.values.toStaticValues(this.data);
  }
}

export class Data implements DataModel {
  /**
   * FIXME: Ideally I'd have made this part of feedback-context-info.js and moved that inside model
   * That, however uses relative-url.js, which utilises a URL and the shims for that don't work
   */
  static FEEDBACK_CONTEXT_ITEMS = [
    {
      key: "feedbackContextInfo_formTitle",
      display: "Feedback source form name",
      get: (contextInfo) => contextInfo.formTitle,
    },
    {
      key: "feedbackContextInfo_pageTitle",
      display: "Feedback source page title",
      get: (contextInfo) => contextInfo.pageTitle,
    },
    {
      key: "feedbackContextInfo_url",
      display: "Feedback source url",
      get: (contextInfo) => contextInfo.url,
    },
  ];

  startPage: string | undefined;
  pages: Array<any> = [];
  lists: Array<any> = [];
  sections: Array<any> = [];
  #conditions: Array<any> = [];
  #name: string = "";
  #feedback;

  constructor(rawData) {
    const rawDataClone =
      rawData instanceof Data
        ? rawData.exposePrivateFields
        : Object.assign({}, rawData);
    this.#conditions = (rawDataClone.conditions || []).map(
      (it) => new Condition(it)
    );
    this.#feedback = rawDataClone.feedback;
    delete rawDataClone.conditions;
    delete rawDataClone.feedback;
    Object.assign(this, rawDataClone);
  }

  _listInputsFor(page, input): Array<Input> {
    const values = this.valuesFor(input)?.toStaticValues();
    return values
      ? values.items.flatMap(
          (listItem) =>
            listItem.children
              ?.filter((it) => it.name)
              ?.map(
                (it) => new Input(it, page, { parentItemName: listItem.label })
              ) ?? []
        )
      : [];
  }

  allInputs(): Array<Input> {
    const inputs: Array<Input> = this.pages.flatMap((page) =>
      (page.components || [])
        .filter((component) => component.name)
        .flatMap((it) =>
          [new Input(it, page, {})].concat(this._listInputsFor(page, it))
        )
    );
    if (this.feedbackForm) {
      const startPage = this.findPage(this.startPage);
      const options = { ignoreSection: true };
      Data.FEEDBACK_CONTEXT_ITEMS.forEach((it) => {
        inputs.push(
          new Input(
            { type: "TextField", title: it.display, name: it.key },
            startPage,
            options
          )
        );
      });
    }
    const names = new Set();
    return inputs.filter((input: Input) => {
      const isPresent = !names.has(input.propertyPath);
      names.add(input.propertyPath);
      return isPresent;
    });
  }

  inputsAccessibleAt(path: string): Array<Input> {
    const precedingPages = this._allPathsLeadingTo(path);
    return this.allInputs().filter(
      (it) => precedingPages.includes(it.page.path) || path === it.page.path
    );
  }

  findPage(path: string | undefined) {
    return this.getPages().find((p) => p?.path === path);
  }

  findList(listName: string) {
    return this.lists.find((list) => list.name === listName);
  }

  addList(list) {
    this.lists.push(list);
  }

  addLink(from: string, to: string, condition: string): Data {
    const fromPage = this.pages.find((p) => p.path === from);
    const toPage = this.pages.find((p) => p.path === to);
    if (fromPage && toPage) {
      const existingLink = fromPage.next?.find(
        (it: { path: string }) => it.path === to
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
    if (!this.sections.find((s) => s.name === name)) {
      this.sections.push({ name, title });
    }
    return this;
  }

  updateLink(from: string, to: string, condition: string): Data {
    const fromPage = this.findPage(from);
    const toPage = this.pages.find((p) => p.path === to);
    if (fromPage && toPage) {
      const existingLink = fromPage.next?.find((it) => it.path === to);
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
      .filter((p) => p.next && p.next.find((link) => link.path === oldPath))
      .forEach((page) => {
        page.next.find((link) => link.path === oldPath).path = newPath;
      });
    return this;
  };

  addPage(page): Data {
    this.pages.push(page);
    return this;
  }

  getPages(): Array<any> {
    return this.pages;
  }

  valuesFor(input): ValuesWrapper | undefined {
    const values = this._valuesFor(input);

    if (values) {
      return new ValuesWrapper(values, this);
    }

    return undefined;
  }

  _valuesFor(input): ComponentValues | null {
    if (input.type === "YesNoField") {
      return yesNoValues;
    }
    if (input.values) {
      return valuesFrom(input.values);
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

  addCondition(name: string, displayName: string, value): Data {
    this.#conditions = this.#conditions;
    if (this.#conditions.find((it) => it.name === name)) {
      throw Error(`A condition already exists with name ${name}`);
    }
    this.#conditions.push({ name, displayName, value });
    return this;
  }

  addComponent(pagePath: string, component): Data {
    const page = this.findPage(pagePath);
    if (page) {
      page.components = page.components || [];
      page.components.push(component);
    } else {
      throw Error(`No page exists with path ${pagePath}`);
    }
    return this;
  }

  updateComponent(pagePath: string, componentName: string, component): Data {
    const page = this.findPage(pagePath);
    if (page) {
      page.components = page.components || [];
      const index = page.components.findIndex(
        (it) => it.name === componentName
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
      this.getPages().forEach((p) => {
        Array.isArray(p.next) &&
          p.next.forEach((n) => {
            if (n.if === name) {
              delete n.if;
            }
          });
      });
    }
    return this;
  }

  findCondition(name: string): Condition | undefined {
    return this.conditions.find((condition) => condition.name === name);
  }

  get hasConditions(): boolean {
    return this.conditions.length > 0;
  }

  get conditions(): Array<Condition> {
    return this.#conditions.map((it) => clone(it));
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

  get feedbackUrl(): string {
    return this.#feedback?.url;
  }

  clone(): Data {
    return new Data(this.exposePrivateFields);
  }

  toJSON(): { [key: string]: any } {
    return Object.fromEntries(
      Object.entries(this.exposePrivateFields).filter(([_field, value]) => {
        return value && typeof value !== "function";
      })
    );
  }

  get exposePrivateFields() {
    return {
      ...this,
      name: this.name,
      feedback: this.#feedback,
      conditions: this.#conditions.map((it) => ({ ...it })),
    };
  }
}
