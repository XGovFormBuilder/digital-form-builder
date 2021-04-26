import { ComponentDef, Page } from "@xgovformbuilder/model";
import { UseFindPage } from "../../../hooks/data/usePages";

export function addComponent(
  data,
  pagePath: Page["path"],
  component: ComponentDef
) {
  const clone = { ...data };
  const [page, index] = UseFindPage(pagePath);
  if (page) {
    clone.pages[index].components ||= [];
    clone.components.push(component);
    return clone;
  } else {
    throw Error(`No page exists with path ${pagePath}`);
  }
}
