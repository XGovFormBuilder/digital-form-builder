import { Page } from "@xgovformbuilder/model";
import { useContext } from "react";
import { DataContext } from "../../context";
import { ConditionsWrapper } from "@xgovformbuilder/model/dist/browser/data-model";

type Path = Page["path"];
export function UseFindPage(path: Path): Page | undefined {
  const { data } = useContext(DataContext);

  return data.pages.find((page) => page?.path === path);
}

function UseUpdateLinksTo(oldPath: Path, newPath: Path) {}

export function UseGetPages() {}

function UseAddPage(page: Page) {}
