import { ComponentDef } from "@xgovformbuilder/model";
import { findPage } from "../../../hooks/data/usePages";
import { Path } from "../types";

export function updateComponent(
  data,
  pagePath: Path,
  componentName: ComponentDef["name"],
  component: ComponentDef
) {
  const [page] = findPage(pagePath);
  if (page) {
    const components = [...(page.components ?? [])];
    const componentIndex =
      page.components?.findIndex(
        (component: ComponentDef) => component.name === componentName
      ) ?? -1;

    if (componentIndex < 0) {
      throw Error(
        `No component exists with name ${componentName} with in page with path ${pagePath}`
      );
    }

    components[componentIndex] = component;
    data.components[componentIndex] = component;

    const updatedPages = data.pages.map((pg) =>
      pg.path === page.path ? { ...pg, components } : pg
    );

    return { ...data, pages: updatedPages };
  }
  throw Error(`No page exists with path ${pagePath}`);
}
