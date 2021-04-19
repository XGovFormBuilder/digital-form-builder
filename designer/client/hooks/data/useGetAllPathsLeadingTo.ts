import { Page } from "@xgovformbuilder/model";
import { useContext } from "react";
import { DataContext } from "../../context";
import dfs from "depth-first";
import { allInputs } from "@xgovformbuilder/model/dist/data-model/data-model";

export function UseGetAllPathsLeadingTo(path: Page["path"]) {
  const { data } = useContext(DataContext);
  const edges = data.pages.flatMap((page) => {
    return (page.next ?? []).map((next): [string, string] => [
      page.path,
      next.path,
    ]);
  });
  return dfs(edges, path, { reverse: true }).filter((p) => p !== path);
}

function UseGetInputsAccessibleAt(path) {
  const pages = UseGetAllPathsLeadingTo(path);
  return allInputs(pages);
}
