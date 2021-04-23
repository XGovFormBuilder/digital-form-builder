import { ConditionName, Path } from "../types";
import { UseFindPage } from "../../../hooks/data/usePages";
import { RawData } from "@xgovformbuilder/model/dist/browser/data-model";
import { ConditionRawData, Link } from "@xgovformbuilder/model";
export function addLink(
  data,
  from: Path,
  to: Path,
  condition?: ConditionName
): RawData {
  const [fromPage, fromPageIndex] = UseFindPage(from);
  const [toPage] = UseFindPage(to);
  const pages = { ...data.pages };
  if (fromPage && toPage) {
    const existingLink = fromPage.next?.find(
      (page: { path: string }) => page.path === to
    );

    if (!existingLink) {
      const link: Link = {
        path: to,
      };

      if (condition) {
        link.condition = condition;
      }

      fromPage.next = fromPage.next || [];
      fromPage.next.push(link);

      pages[fromPageIndex] = fromPage;
    }
  }
  return { ...data, pages };
}

export function updateLink(
  data,
  from: Path,
  to: Path,
  condition?: ConditionRawData["name"]
): RawData | undefined {
  const [fromPage, fromPageIndex] = UseFindPage(from);
  const [toPage] = UseFindPage(to);
  const existingLinkIndex = fromPage.next?.findIndex(
    (page) => page.path === to
  );
  if (!fromPage || !toPage || !existingLinkIndex) {
    return;
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
