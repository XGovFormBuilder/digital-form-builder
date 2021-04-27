import { FormDefinition, Link } from "@xgovformbuilder/model";
import { ConditionName, Path } from "../types";
import { findPage } from "./findPage";

export function addLink(
  data: FormDefinition,
  from: Path,
  to: Path,
  condition?: ConditionName
): FormDefinition {
  const [fromPage, fromPageIndex] = findPage(data, from);
  const [toPage] = findPage(data, to);
  const pages = { ...data.pages };
  if (!fromPage && !toPage) {
    throw Error(`could not find ${from} or ${to}`);
  }

  const existingLink = fromPage.next?.find((page) => page.path === to);

  if (!existingLink) {
    const link: Link = {
      path: to,
    };

    if (condition) {
      link.condition = condition;
    }

    pages[fromPageIndex] = {
      ...fromPage,
      next: [...(fromPage.next ?? []), link],
    };
  }

  return { ...data, pages };
}
