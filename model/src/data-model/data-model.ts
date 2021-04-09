import {
  ConditionsWrapper,
  ConditionWrapperValue,
  ConditionRawData,
} from "./conditions-wrapper";
import { clone, filter } from "../utils/helpers";
import {
  ComponentDef,
  ContentComponentsDef,
  InputFieldsComponentsDef,
  ListComponentsDef,
} from "../components/types";
import { Page, Section, List, Feedback, PhaseBanner } from "./types";
import dfs from "depth-first";

export const isNotContentType = (
  obj: ComponentDef
): obj is InputFieldsComponentsDef | ListComponentsDef => {
  const contentTypes: ContentComponentsDef["type"][] = [
    "Para",
    "Details",
    "Html",
    "InsetText",
  ];
  return !contentTypes.find((type) => `${type}` === `${obj.type}`);
};

export function allInputs(pages) {
  return pages.flatMap((page) => {
    const inputs = (page.components ?? []).filter(isNotContentType);
    return inputs.map((input) => {
      return {
        name: input.name,
        page: { path: page.path, section: page.section },
        propertyPath: !!page.section
          ? `${page.section}.${input.name}`
          : input.name,
        title: input.title,
        list: input.list,
        type: input.type,
      };
    });
  });
}

export type RawData = Pick<
  Data,
  "startPage" | "pages" | "lists" | "sections"
> & {
  name?: string;
  conditions?: ConditionRawData[];
  feedback?: Feedback;
  phaseBanner?: PhaseBanner;
};

/**
 * FIXME:- This class is seriously bloated and most of the methods are not used by the runner at all. I don't even know why it's in /model..!
 */
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

  addCondition(
    name: string,
    displayName: string,
    value: ConditionWrapperValue
  ): Data {
    if (this.#conditions.find((condition) => condition.name === name)) {
      throw Error(`A condition already exists with name ${name}`);
    }

    this.#conditions.push(new ConditionsWrapper({ name, displayName, value }));
    return this;
  }

  addComponent(pagePath: string, component: ComponentDef): Data {
    const page = this.findPage(pagePath);
    if (page) {
      page.components ||= [];
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
    this.#name ||= name;
  }

  //FIXME:- isFeedbackForm?
  get feedbackForm(): boolean {
    return this.#feedback?.feedbackForm ?? false;
  }

  set feedbackForm(feedbackForm: boolean) {
    this.#feedback = { ...(this.#feedback ?? {}), feedbackForm };
  }

  //FIXME:- should just be a setter method
  setFeedbackUrl(url: string) {
    if (url && this.feedbackForm) {
      throw Error("Cannot set a feedback url on a feedback form");
    }

    this.#feedback = { ...(this.#feedback ?? {}), url };
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

  get allInputs() {
    return allInputs(this.pages);
  }

  allPathsLeadingTo(path) {
    const edges = this.pages.flatMap((page) => {
      return (page.next ?? []).map((next) => [page.path, next.path]);
    });
    // @ts-ignore
    return dfs(edges, path, { reverse: true }).filter((p) => p !== path);
  }

  inputsAccessibleAt(path) {
    const pages = this.allPathsLeadingTo(path).map((path) =>
      this.pages.find((page) => page.path === path)
    );
    return allInputs(pages);
  }

  _exposePrivateFields() {
    return Object.assign({}, this, {
      name: this.name,
      feedback: this.#feedback,
      conditions: this.#conditions.map((condition) => clone(condition)),
    });
  }
}
