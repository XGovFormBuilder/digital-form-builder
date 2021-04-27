import { ComponentDef, Page } from "@xgovformbuilder/model";
import { findPage } from "../page/usePages";

export function addComponent(
  data,
  pagePath: Page["path"],
  component: ComponentDef
) {
  const clone = { ...data };
  const [page, index] = findPage(data, pagePath);
  if (page) {
    const components = [...data.pages[index].components, component];
    return {
      ...clone,
      pages: clone.pages.map((page, i) =>
        i === index ? { ...page, components } : page
      ),
    };
  } else {
    throw Error(`No page exists with path ${pagePath}`);
  }
}
