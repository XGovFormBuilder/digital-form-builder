import { ComponentDef, FormDefinition } from "@xgovformbuilder/model";
import { findPage } from "../page/usePages";
import { Path } from "../../reducers/data/types";

export function addComponent(
  data: FormDefinition,
  pagePath: Path,
  component: ComponentDef
): FormDefinition {
  const [page, index] = findPage(data, pagePath);
  if (!page) {
    throw Error(`No page exists with path ${pagePath}`);
  }
  const { components = [] } = page;
  const updatedPage = { ...page, components: [...components, component] };
  return {
    ...data,
    pages: data.pages.map((page, i) => (index === i ? updatedPage : page)),
  };
}
