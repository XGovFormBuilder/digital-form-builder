import React, { MouseEvent } from "react";
import { ComponentTypes, ComponentDef } from "@xgovformbuilder/model";
import { lowerCase } from "lodash";

import { withI18n, I18n } from "../../i18n";

console.log(ComponentTypes);

const SelectionFieldsTypes = [
  "CheckboxesField",
  "RadiosField",
  "SelectField",
  "YesNoField",
];

const contentFields: ComponentDef[] = [];
const selectionFields: ComponentDef[] = [];
const inputFields: ComponentDef[] = [];

const ascending = (a, b) => (a.title ?? "").localeCompare(b.title);

ComponentTypes.sort(ascending).forEach((component) => {
  if (component.subType === "content") {
    contentFields.push(component);
  } else if (SelectionFieldsTypes.indexOf(component.type) > -1) {
    selectionFields.push(component);
  } else {
    inputFields.push(component);
  }
});

type Props = {
  onSelectComponent: (type: string) => void;
  i18n: I18n;
};

const formatName = (name: string) => {
  return lowerCase(name.replace(/field/, ""));
};

export const ComponentCreateList = ({ onSelectComponent, i18n }: Props) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const element = event.target as HTMLElement;

    console.log(element.getAttribute("data-type"));
    // onSelectComponent(element.getAttribute("data-type")!);
  };

  return (
    <div className="govuk-form-group component-create__list">
      <h1 className="govuk-hint">
        {i18n("Select a component to add to your page")}
      </h1>
      <ol className="govuk-list">
        <li className="component-create__list__item">
          <h2 className="govuk-heading-s">{i18n("Content")}</h2>
          <ol className="govuk-list">
            {contentFields.map((component) => (
              <li key={component.name}>
                <a
                  className="govuk-link"
                  href="#"
                  data-type={component.type}
                  onClick={handleClick}
                >
                  {formatName(component.name)}
                </a>
              </li>
            ))}
          </ol>
          <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
        </li>
        <li className="component-create__list__item">
          <h2 className="govuk-heading-s">{i18n("Input fields")}</h2>
          <ol className="govuk-list">
            {inputFields.map((component) => (
              <li key={component.name}>
                <a className="govuk-link" href="#">
                  {formatName(component.name)} field
                </a>
              </li>
            ))}
          </ol>
          <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
        </li>
        <li className="component-create__list__item">
          <h2 className="govuk-heading-s">{i18n("Selection fields")}</h2>
          <ol className="govuk-list">
            {selectionFields.map((component) => (
              <li key={component.name}>
                <a className="govuk-link" href="#">
                  {formatName(component.name)}
                </a>
              </li>
            ))}
          </ol>
          <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
        </li>
      </ol>
    </div>
  );
};

export default withI18n(ComponentCreateList);
