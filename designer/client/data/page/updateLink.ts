import { ConditionRawData, FormDefinition } from "@xgovformbuilder/model";
import { Path } from "../../reducers/data/types";
import { findPage } from "./findPage";

export function updateLink(
  data: FormDefinition,
  from: Path,
  to: Path,
  condition?: ConditionRawData["name"]
): FormDefinition {
  const [fromPage, fromPageIndex] = findPage(data, from);
  findPage(data, to);
  const existingLinkIndex =
    fromPage.next?.findIndex((next) => next.path === to) ?? -1;
  if (existingLinkIndex < 0) {
    throw Error("Could not find page or links to update");
  }

  const updatedNext = [...fromPage.next!];
  updatedNext[existingLinkIndex] = {
    ...updatedNext[existingLinkIndex],
    condition,
  };
  const updatedPage = { ...fromPage, next: updatedNext };

  const pages = [...data.pages];
  pages[fromPageIndex] = updatedPage;
  return { ...data, pages };
}
