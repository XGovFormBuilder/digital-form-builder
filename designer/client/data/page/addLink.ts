import { FormDefinition, Link } from "@xgovformbuilder/model";
import { ConditionName, Path } from "../types";
import { findPage } from "./findPage";

export function addLink(
  data: FormDefinition,
  from: Path,
  to: Path,
  condition?: ConditionName
): FormDefinition {
  if (from === to) {
    throw Error("cannot link a page to itself");
  }
  const [fromPage, index] = findPage(data, from);
  findPage(data, to);
  const pages = [...data.pages];

  const existingLink = fromPage.next?.find((page) => page.path === to);

  if (!existingLink) {
    const link: Link = {
      path: to,
    };

    if (condition) {
      link.condition = condition;
    }

    const updatedPage = {
      ...fromPage,
      next: [...(fromPage.next ?? []), link],
    };

    return {
      ...data,
      pages: pages.map((page, i) => (i === index ? updatedPage : page)),
    };
  } else {
    return data;
  }
}
