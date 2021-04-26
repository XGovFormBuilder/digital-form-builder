/**
 * TODO:- probably better in a reducer
 */

import { ComponentDef, Page } from "@xgovformbuilder/model";
import { findPage } from "./usePages";

type PagePath = Page["path"];

function updateComponent(
  pagePath: PagePath,
  componentName: ComponentDef["name"],
  component: ComponentDef
) {
  const page = findPage(pagePath);

  if (page) {
    page.components ||= [];

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
}

function addComponent(pagePath: PagePath, component: ComponentDef) {
  const page = findPage(pagePath);
  if (page) {
    page.components ||= [];
    page.components.push(component);
  } else {
    throw Error(`No page exists with path ${pagePath}`);
  }
}

export function UseDataComponent() {
  return {
    add: addComponent,
    update: updateComponent,
  };
}
