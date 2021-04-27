import { FormDefinition, Page } from "@xgovformbuilder/model";
import { Found } from "..";
type Path = Page["path"];

/**
 * @returns returns a tuple of [Page, number]
 */
export function findPage(data: FormDefinition, path: Path): Found<Page> {
  const index = data.pages.findIndex((page) => page?.path === path);
  if (index < 0) {
    throw Error("no page found");
  }
  return [{ ...data.pages[index] }, index];
}
