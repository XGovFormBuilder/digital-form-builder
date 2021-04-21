import { Page } from "@xgovformbuilder/model";
import { useContext } from "react";
import { DataContext } from "../../context";
import { ConditionsWrapper } from "@xgovformbuilder/model/dist/browser/data-model";

type Path = Page["path"];

/**
 * @returns returns a tuple of [Page, number]
 */
export function UseFindPage(path: Path): [Page, number] | undefined {
  const { data } = useContext(DataContext);
  const index = data.pages.findIndex((page) => page?.path === path);
  if (index) {
    return [{ ...data.pages[index] }, index];
  }
}

function UseUpdateLinksTo(oldPath: Path, newPath: Path) {}

export function UseGetPages() {}

function UseAddPage(page: Page) {}
