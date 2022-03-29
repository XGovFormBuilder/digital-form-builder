import { FormDefinition, Page } from "@xgovformbuilder/model";
import dfs from "depth-first";

export function allPathsLeadingTo(data: FormDefinition, path: Page["path"]) {
  const edges = data.pages.flatMap((page) => {
    return (page.next ?? []).map((next): [string, string] => [
      page.path,
      next.path,
    ]);
  });
  return dfs(edges, path, { reverse: true });
}
