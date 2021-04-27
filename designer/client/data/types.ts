import {
  ComponentDef,
  ConditionRawData,
  ContentComponentsDef,
  InputFieldsComponentsDef,
  ListComponentsDef,
  Page,
} from "@xgovformbuilder/model";

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

export type Input = {
  name: string;
  page: Pick<Page, "path" | "section">;
  propertyPath: string;
  list: string;
  type: Pick<InputFieldsComponentsDef, "type">;
};

export type Path = Page["path"];
export type ConditionName = ConditionRawData["name"];
type ConditionDisplayName = Pick<ConditionRawData, "displayName">;
