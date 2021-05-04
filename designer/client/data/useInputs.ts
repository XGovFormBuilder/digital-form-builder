import { Input, isNotContentType } from "./types";
import { allPathsLeadingTo } from "./page";
import { Path } from "./types";
import { FormDefinition } from "@xgovformbuilder/model";

export function allInputs(pages): Input[] {
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

export function inputsAccessibleAt(data: FormDefinition, path: Path) {
  const pages = allPathsLeadingTo(data, path);
  return allInputs(pages);
}
