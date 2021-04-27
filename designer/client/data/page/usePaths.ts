import { FormDefinition, Page } from "@xgovformbuilder/model";
import { useContext } from "react";
import { DataContext } from "../../context";
import dfs from "depth-first";
import { allInputs } from "@xgovformbuilder/model/dist/data-model/data-model";

export function allPathsLeadingTo(data: FormDefinition, path: Page["path"]) {
  const edges = data.pages.flatMap((page) => {
    return (page.next ?? []).map((next): [string, string] => [
      page.path,
      next.path,
    ]);
  });
  return dfs(edges, path, { reverse: true }).filter((p) => p !== path);
}
