import {
  ComponentDef,
  ConditionRawData,
  ContentComponentsDef,
  FormDefinition,
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
  page: { path: Page["path"]; section: Page["section"] };
  propertyPath: string;
  list: string | undefined;
  title: string;
  type: InputFieldsComponentsDef["type"] | ListComponentsDef["type"];
};

export type Path = Page["path"];
export type ConditionName = ConditionRawData["name"];
export type Found<T> = [T, number];

export enum DataErrorTypes {
  LINK = "LINK",
  CONDITION = "CONDITION",
  LIST = "LIST",
  PAGE = "PAGE",
}
type DataError = {
  error: {
    name: DataErrorTypes;
    message: string;
    stack?: Error["stack"];
  };
};

export function Stack(): Error["stack"] {
  try {
    throw new Error();
  } catch (e) {
    console.error(e);
    return e.stack;
  }
}

export function DataError(name: DataErrorTypes, message: string): DataError {
  return {
    error: { name, message, stack: Stack() },
  };
}
export type FormDefinitionResult = FormDefinition | DataError;
export type FoundResult<T> = Found<T>;
export type DataResult<T> = T extends FormDefinitionResult
  ? FormDefinitionResult
  : FoundResult<T>;
