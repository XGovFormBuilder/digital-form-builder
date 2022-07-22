import React, { useState } from "react";
import { SortableHandle } from "react-sortable-hoc";
import { Flyout } from "./components/Flyout";
import { SearchIcon } from "./components/Icons";
import ComponentEdit from "./ComponentEdit";
import { ComponentContextProvider } from "./reducers/component/componentReducer";
import { i18n } from "./i18n";

const DragHandle = SortableHandle(() => (
  <span className="drag-handle">&#9776;</span>
));

const Base = (props) => {
  return <div>{props.children}</div>;
};

const ComponentField = (props) => {
  return <Base>{props.children}</Base>;
};

const TextField = () => {
  return (
    <ComponentField>
      <div className="box" />
    </ComponentField>
  );
};

const TelephoneNumberField = () => {
  return (
    <ComponentField>
      <div className="box tel" />
    </ComponentField>
  );
};

const EmailAddressField = () => {
  return (
    <ComponentField>
      <div className="box email" />
    </ComponentField>
  );
};

const UkAddressField = () => {
  return (
    <ComponentField>
      <span className="box" />
      <span className="button search">
        <SearchIcon width={20} height={20} />
      </span>
    </ComponentField>
  );
};

const MultilineTextField = () => {
  return (
    <ComponentField>
      <span className="box tall" />
    </ComponentField>
  );
};

const NumberField = () => {
  return (
    <ComponentField>
      <div className="box number" />
    </ComponentField>
  );
};

const DateField = () => {
  return (
    <ComponentField>
      <div className="box dropdown">
        <span className="govuk-body govuk-!-font-size-14">dd/mm/yyyy</span>
      </div>
    </ComponentField>
  );
};

const DateTimeField = () => {
  return (
    <ComponentField>
      <div className="box large dropdown">
        <span className="govuk-body govuk-!-font-size-14">
          dd/mm/yyyy hh:mm
        </span>
      </div>
    </ComponentField>
  );
};

const TimeField = () => {
  return (
    <ComponentField>
      <div className="box">
        <span className="govuk-body govuk-!-font-size-14">hh:mm</span>
      </div>
    </ComponentField>
  );
};

const DateTimePartsField = () => {
  return (
    <ComponentField>
      <span className="box small" />
      <span className="box small govuk-!-margin-left-1 govuk-!-margin-right-1" />
      <span className="box medium govuk-!-margin-right-1" />
      <span className="box small govuk-!-margin-right-1" />
      <span className="box small" />
    </ComponentField>
  );
};

const MonthYearField = () => {
  return (
    <ComponentField>
      <span className="box small govuk-!-margin-left-1 govuk-!-margin-right-1" />
      <span className="box medium" />
    </ComponentField>
  );
};

const DatePartsField = () => {
  return (
    <ComponentField>
      <span className="box small" />
      <span className="box small govuk-!-margin-left-1 govuk-!-margin-right-1" />
      <span className="box medium" />
    </ComponentField>
  );
};

const RadiosField = () => {
  return (
    <ComponentField>
      <div className="govuk-!-margin-bottom-1">
        <span className="circle" />
        <span className="line short" />
      </div>
      <div className="govuk-!-margin-bottom-1">
        <span className="circle" />
        <span className="line short" />
      </div>
      <span className="circle" />
      <span className="line short" />
    </ComponentField>
  );
};

const CheckboxesField = () => {
  return (
    <ComponentField>
      <div className="govuk-!-margin-bottom-1">
        <span className="check" />
        <span className="line short" />
      </div>
      <div className="govuk-!-margin-bottom-1">
        <span className="check" />
        <span className="line short" />
      </div>
      <span className="check" />
      <span className="line short" />
    </ComponentField>
  );
};

const SelectField = () => {
  return (
    <ComponentField>
      <div className="box dropdown" />
    </ComponentField>
  );
};

const YesNoField = () => {
  return (
    <ComponentField>
      <div className="govuk-!-margin-bottom-1">
        <span className="circle" />
        <span className="line short" />
      </div>
      <span className="circle" />
      <span className="line short" />
    </ComponentField>
  );
};

const FileUploadField = () => {
  return (
    <ComponentField>
      <div className="govuk-!-margin-bottom-1">
        {"🗂"} <span className="line short" />
      </div>
    </ComponentField>
  );
};

const Details = () => {
  return (
    <Base>
      {"▶ "}
      <span className="line short" />
    </Base>
  );
};

const InsetText = () => {
  return (
    <Base>
      <div className="inset govuk-!-padding-left-2">
        <div className="line" />
        <div className="line short govuk-!-margin-bottom-2 govuk-!-margin-top-2" />
        <div className="line" />
      </div>
    </Base>
  );
};

const WarningText = () => {
  return (
    <Base>
      <div className="warning govuk-!-padding-left-2">
        <div className="line" />
        <div className="line short govuk-!-margin-bottom-2 govuk-!-margin-top-2" />
        <div className="line" />
      </div>
    </Base>
  );
};

const Para = () => {
  return (
    <Base>
      <div className="line" />
      <div className="line short govuk-!-margin-bottom-2 govuk-!-margin-top-2" />
      <div className="line" />
    </Base>
  );
};

const FlashCard = () => {
  return (
    <Base>
      <div className="line short govuk-!-margin-bottom-2 govuk-!-margin-top-2" />
      <div className="line" />
    </Base>
  );
};

const List = () => {
  return (
    <Base>
      <div className="line short govuk-!-margin-bottom-2 govuk-!-margin-top-2" />
      <div className="line short govuk-!-margin-bottom-2 govuk-!-margin-top-2" />
      <div className="line short govuk-!-margin-bottom-2 govuk-!-margin-top-2" />
    </Base>
  );
};

const Html = () => {
  return (
    <Base>
      <div className="html">
        <span className="line xshort govuk-!-margin-bottom-1 govuk-!-margin-top-1" />
      </div>
    </Base>
  );
};

export const componentTypes = {
  TextField,
  TelephoneNumberField,
  NumberField,
  EmailAddressField,
  TimeField,
  DateField,
  DateTimeField,
  DatePartsField,
  DateTimePartsField,
  MonthYearField,
  MultilineTextField,
  RadiosField,
  CheckboxesField,
  AutocompleteField: SelectField,
  SelectField: SelectField,
  YesNoField: YesNoField,
  UkAddressField,
  FileUploadField,
  Para,
  Details,
  Html,
  InsetText,
  FlashCard,
  List,
  WarningText,
  WebsiteField: TextField,
};

export function Component(props) {
  const [showEditor, setShowEditor] = useState();
  const toggleShowEditor = (value) => {
    setShowEditor(value ?? !showEditor);
  };
  const { data, page, component } = props;
  const TagName = componentTypes[`${component.type}`];
  const editFlyoutTitle = i18n("component.edit", {
    name: i18n(`fieldTypeToName.${component.type}`),
  });

  return (
    <div>
      <div className="component govuk-!-padding-2" onClick={toggleShowEditor}>
        <DragHandle />
        <TagName />
      </div>
      {showEditor && (
        <Flyout title={editFlyoutTitle} show={true} onHide={toggleShowEditor}>
          <ComponentContextProvider pagePath={page.path} component={component}>
            <ComponentEdit page={page} toggleShowEditor={toggleShowEditor} />
          </ComponentContextProvider>
        </Flyout>
      )}
    </div>
  );
}