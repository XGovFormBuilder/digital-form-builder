import { createContext, useContext } from "react";
import {
  Data,
  Page,
  Section,
  Item,
  List,
  Feedback,
  PhaseBanner,
} from "@xgovformbuilder/model";

export const DataContext = createContext<{
  data: Data;
  save: (toUpdate: Data) => Promise<false>;
}>({
  data: {} as Data,
  save: async (_data: Data) => false,
});

function UseFindPage(path: Page["path"]): Page | undefined {
  const { data } = useContext(DataContext);
  return data.pages.find((page) => page?.path === path);
}

function findList() {}

function findCondition() {}

function getAllInputs() {}

function getAllPathsLeadingTo() {}

function getInputsAccessibleAt(path) {}
