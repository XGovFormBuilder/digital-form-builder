/**
 * TODO:- probably better in a reducer
 */

import { ComponentDef, FormDefinition, Page } from "@xgovformbuilder/model";
import { findPage } from "./page/usePages";
import { Path } from "../reducers/data/types";

type PagePath = Page["path"];

export function updateComponent(
  data,
  pagePath: Path,
  componentName: ComponentDef["name"],
  component: ComponentDef
) {
  const [page] = findPage(data, pagePath);
  if (!page) {
    throw Error(`No page exists with path ${pagePath}`);
  }
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

  const updatedPage = {
    ...page,
    components: components.map((c, i) =>
      i === componentIndex ? component : c
    ),
  };

  const updatedPages = data.pages.map((pg) =>
    pg.path === pagePath ? updatedPage : pg
  );

  return { ...data, pages: updatedPages };
}
export function addComponent(
  data: FormDefinition,
  pagePath: PagePath,
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
