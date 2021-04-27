import { FormDefinition, Section } from "@xgovformbuilder/model";

export function addSection(data: FormDefinition, section: Section) {
  return {
    ...data,
    sections: [...data.sections, section],
  };
}
