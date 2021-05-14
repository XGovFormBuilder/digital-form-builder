import { FormDefinition, Section } from "@xgovformbuilder/model";

/**
 * @param data - Data from DataContext
 * @param section - The section to add
 * @throws Error - if a section already exists with the same name
 */
export function addSection(
  data: FormDefinition,
  section: Section
): FormDefinition {
  if (data.sections.find((s) => s.name === section.name)) {
    throw Error(`A section with the name ${section.name} already exists`);
  }
  return {
    ...data,
    sections: [...data.sections, section],
  };
}
