import { FormDefinition, Page } from "@xgovformbuilder/model";
import { Found, Path } from "..";

/**
 * @returns returns a tuple of [Page, number]
 */
export function findPage(data: FormDefinition, path: Path): Found<Page> {
  const index = data.pages.findIndex((page) => page?.path === path);
  if (index < 0) {
    throw Error(`no page found with the path ${path}`);
  }
  return [{ ...data.pages[index] }, index];
}
