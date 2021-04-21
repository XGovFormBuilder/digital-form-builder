import { ComponentDef } from "@xgovformbuilder/model";
import { UseFindPage } from "../../../hooks/data/usePages";

export function addComponent(
  data,
  pagePath: PagePath,
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
