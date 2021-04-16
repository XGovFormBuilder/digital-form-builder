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
import { ConditionsWrapper } from "@xgovformbuilder/model/dist/browser/data-model";
import {
  ComponentDef,
  ContentComponentsDef,
  InputFieldsComponentsDef,
  ListComponentsDef,
} from "@xgovformbuilder/model/dist";
import dfs, { Edges } from "depth-first";

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

function UseFindList(name: List["name"]): List | undefined {
  const { data } = useContext(DataContext);
  return data.lists.find((list) => list.name === name);
}

function UseFindCondition(
  name: ConditionsWrapper["name"]
): ConditionsWrapper | undefined {
  const { data } = useContext(DataContext);
  return data.conditions.find((condition) => condition.name === name);
}

export const isNotContentType = (
  obj: ComponentDef
): obj is InputFieldsComponentsDef | ListComponentsDef => {
  const contentTypes: ContentComponentsDef["type"][] = [
    "Para",
    "Details",
    "Html",
    "InsetText",
  ];
  return !contentTypes.find((type) => `${type}` === `${obj.type}`);
};

function allInputs(pages) {
  return pages.flatMap((page) => {
    const inputs = (page.components ?? []).filter(isNotContentType);
    return inputs.map((input) => {
      return {
        name: input.name,
        page: { path: page.path, section: page.section },
        propertyPath: !!page.section
          ? `${page.section}.${input.name}`
          : input.name,
        title: input.title,
        list: input.list,
        type: input.type,
      };
    });
  });
}

function UseGetAllInputs(): Page[] {
  const { data } = useContext(DataContext);
  return allInputs(data.pages);
}


function UseGetAllPathsLeadingTo(path: Page["path"]) {
  const { data } = useContext(DataContext);
  const edges = data.pages.flatMap((page) => {
    return (page.next ?? []).map((next): [string, string] => [
      page.path,
      next.path,
    ]);
  });
  return dfs(edges, path, { reverse: true }).filter((p) => p !== path);
}

function getInputsAccessibleAt(path) {
  const pages = UseGetAllPathsLeadingTo(path);
}
