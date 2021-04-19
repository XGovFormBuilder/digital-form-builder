import { Page } from "@xgovformbuilder/model";
import { useContext } from "react";
import { DataContext } from "../../context";

function UseFindPage(path: Page["path"]): Page | undefined {
  const { data } = useContext(DataContext);

  return data.pages.find((page) => page?.path === path);
}
