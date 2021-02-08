import { clone } from "../utils/helpers";
import { ComponentDef } from "../components/types";
import { Page } from "./types";

export class InputWrapper {
  name: string | undefined = undefined;
  title: string | undefined = undefined;
  type: string | undefined = undefined;
  propertyPath: string | undefined;
  #parentItemName: string | undefined;
  page: Page;

  constructor(
    rawData: ComponentDef,
    page: Page,
    options: { ignoreSection?: boolean; parentItemName?: string }
  ) {
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
