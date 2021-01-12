import React from "react";

const listTypes = [
  "SelectField",
  "RadiosField",
  "CheckboxesField",
  "AutocompleteField",
];

export function componentToString(component) {
  if (~listTypes.indexOf(component.type)) {
    return `${component.type}<${component.options.list}>`;
  }
  return `${component.type}`;
}

export function DataPrettyPrint(props) {
  const { data } = props;
  const { sections, pages } = data;

  const model = {};

  pages.forEach((page) => {
    page.components.forEach((component) => {
      if (component.name) {
        if (page.section) {
          const section = sections.find(
            (section) => section.name === page.section
          );
          if (!model[section.name]) {
            model[section.name] = {};
          }

          model[section.name][component.name] = `${component.type}`;
        } else {
          model[component.name] = `${component.type}`;
        }
      }
    });
  });

  return (
    <div>
      <pre>{JSON.stringify(model, null, 2)}</pre>
    </div>
  );
}
