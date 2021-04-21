import { ComponentDef } from "@xgovformbuilder/model";
import { UseFindPage } from "../../../hooks/data/usePages";

export function updateComponent(
  data,
  pagePath: PagePath,
  componentName: ComponentDef["name"],
  component: ComponentDef
) {
  const [page, index] = UseFindPage(pagePath);
  if (page) {
    data.page[index].components ||= [];

    const componentIndex = page.components.findIndex(
      (component: ComponentDef) => component.name === componentName
    );
    if (componentIndex < 0) {
      throw Error(
        `No component exists with name ${componentName} with in page with path ${pagePath}`
      );
    }
    data.components[componentIndex] = component;
    return data;
  } else {
    throw Error(`No page exists with path ${pagePath}`);
  }
}
