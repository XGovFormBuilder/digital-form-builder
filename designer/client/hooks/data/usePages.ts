import { FormDefinition, Page } from "@xgovformbuilder/model";
import { useContext } from "react";
import { DataContext } from "../../context";

type Path = Page["path"];
type FoundPage = [Page, number];

/**
 * @returns returns a tuple of [Page, number]
 */
export function findPage(data: FormDefinition, path: Path): FoundPage {
  const index = data.pages.findIndex((page) => page?.path === path);
  if (index < 0) {
    throw Error("no page found");
  }
  return [{ ...data.pages[index] }, index];
}

function UseUpdateLinksTo(oldPath: Path, newPath: Path) {}

export function UseGetPages() {}

function UseAddPage(page: Page) {}
