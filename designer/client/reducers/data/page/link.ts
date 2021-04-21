import { Path } from "../types";
import { UseFindPage } from "../../../hooks/data/usePages";

export function addLink(data, from: Path, to: Path, condition?: conditionName) {
  const [fromPage, fromPageIndex] = UseFindPage(from);
  const [toPage] = UseFindPage(to);
  const pages = { ...data.pages };
  if (fromPage && toPage) {
    const existingLink = fromPage.next?.find(
      (page: { path: string }) => page.path === to
    );

    if (!existingLink) {
      const link: { path: string; condition?: string } = {
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
}
