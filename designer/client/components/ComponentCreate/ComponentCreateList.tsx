import React, { MouseEvent, useCallback } from "react";
import { ComponentTypes, ComponentDef } from "@xgovformbuilder/model";
import sortBy from "lodash/sortBy";

import { i18n } from "../../i18n";

const SelectionFieldsTypes = [
  "CheckboxesField",
  "RadiosField",
  "SelectField",
  "YesNoField",
];

const contentFields: ComponentDef[] = [];
const selectionFields: ComponentDef[] = [];
const inputFields: ComponentDef[] = [];

sortBy(ComponentTypes, ["type"]).forEach((component) => {
  if (component.subType === "content") {
    contentFields.push(component);
  } else if (SelectionFieldsTypes.indexOf(component.type) > -1) {
    selectionFields.push(component);
  } else {
    inputFields.push(component);
  }
});

type Props = {
  onSelectComponent: (type: ComponentDef) => void;
};

export const ComponentCreateList = ({ onSelectComponent }: Props) => {
  const selectComponent = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, component: ComponentDef) => {
      event.preventDefault();
      onSelectComponent(component);
    },
    []
  );
  return (
    <div
      className="govuk-form-group component-create__list"
      data-testid="component-create-list"
    >
      <h1 className="govuk-hint">{i18n("component.create_info")}</h1>
      <ol className="govuk-list">
        <li className="component-create__list__item">
          <h2 className="govuk-heading-s">{i18n("Content")}</h2>
          <div className="govuk-hint">
            {i18n("component.contentfields_info")}
          </div>
          <ol className="govuk-list">
            {contentFields.map((component) => (
              <li key={component.name}>
                <a
                  className="govuk-link"
                  href="#0"
                  onClick={(e) => selectComponent(e, component)}
                >
                  {i18n(`fieldTypeToName.${component.type}`)}
                </a>
                <div className="govuk-hint">
                  {i18n(`fieldTypeToName.${component.type}_info`)}
                </div>
              </li>
            ))}
          </ol>
          <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
        </li>
        <li className="component-create__list__item">
          <h2 className="govuk-heading-s">{i18n("Input fields")}</h2>
          <div className="govuk-hint">{i18n("component.inputfields_info")}</div>
          <ol className="govuk-list">
            {inputFields.map((component) => (
              <li key={component.type}>
                <a
                  href="#0"
                  className="govuk-link"
                  onClick={(e) => selectComponent(e, component)}
                >
                  {i18n(`fieldTypeToName.${component.type}`)}
                </a>
                <div className="govuk-hint">
                  {i18n(`fieldTypeToName.${component.type}_info`)}
                </div>
              </li>
            ))}
          </ol>
          <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
        </li>
        <li className="component-create__list__item">
          <h2 className="govuk-heading-s">{i18n("Selection fields")}</h2>
          <div className="govuk-hint">
            {i18n("component.selectfields_info")}
          </div>
          <ol className="govuk-list">
            {selectionFields.map((component) => (
              <li key={component.type}>
                <a
                  href="#0"
                  className="govuk-link"
                  onClick={(e) => selectComponent(e, component)}
                >
                  {i18n(`fieldTypeToName.${component.type}`)}
                </a>
                <div className="govuk-hint">
                  {i18n(`fieldTypeToName.${component.type}_info`)}
                </div>
              </li>
            ))}
          </ol>
        </li>
      </ol>
    </div>
  );
};
