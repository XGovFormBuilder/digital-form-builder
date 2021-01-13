import React, { useState } from "react";
import { SortableHandle } from "react-sortable-hoc";
import { Flyout } from "./components/Flyout";
import ComponentEdit from "./ComponentEdit";
import { ComponentContextProvider } from "./reducers/component/componentReducer";
import { i18n } from "./i18n";

const DragHandle = SortableHandle(() => (
  <span className="drag-handle">&#9776;</span>
));

export const componentTypes = {
  TextField: TextField,
  TelephoneNumberField: TelephoneNumberField,
  NumberField: NumberField,
  EmailAddressField: EmailAddressField,
  TimeField: TimeField,
  DateField: DateField,
  DateTimeField: DateTimeField,
  DatePartsField: DatePartsField,
  DateTimePartsField: DateTimePartsField,
  MultilineTextField: MultilineTextField,
  RadiosField: RadiosField,
  CheckboxesField: CheckboxesField,
  AutocompleteField: SelectField,
  SelectField: SelectField,
  YesNoField: YesNoField,
  UkAddressField: UkAddressField,
  FileUploadField: FileUploadField,
  Para: Para,
  Details: Details,
  Html: Html,
  InsetText: InsetText,
  FlashCard: FlashCard,
  List: List,
  WarningText: WarningText,
};

function Base(props) {
  return <div>{props.children}</div>;
}

function ComponentField(props) {
  return <Base>{props.children}</Base>;
}

function TextField() {
  return (
    <ComponentField>
      <div className="box" />
    </ComponentField>
  );
}

function TelephoneNumberField() {
  return (
    <ComponentField>
      <div className="box tel" />
    </ComponentField>
  );
}

function EmailAddressField() {
  return (
    <ComponentField>
      <div className="box email" />
    </ComponentField>
  );
}

function UkAddressField() {
  return (
    <ComponentField>
      <span className="box" />
      <span className="button square" />
    </ComponentField>
  );
}

function MultilineTextField() {
  return (
    <ComponentField>
      <span className="box tall" />
    </ComponentField>
  );
}

function NumberField() {
  return (
    <ComponentField>
      <div className="box number" />
    </ComponentField>
  );
}

function DateField() {
  return (
    <ComponentField>
      <div className="box dropdown">
        <span className="govuk-body govuk-!-font-size-14">dd/mm/yyyy</span>
      </div>
    </ComponentField>
  );
}

function DateTimeField() {
  return (
    <ComponentField>
      <div className="box large dropdown">
        <span className="govuk-body govuk-!-font-size-14">
          dd/mm/yyyy hh:mm
        </span>
      </div>
    </ComponentField>
  );
}

function TimeField() {
  return (
    <ComponentField>
      <div className="box">
        <span className="govuk-body govuk-!-font-size-14">hh:mm</span>
      </div>
    </ComponentField>
  );
}

function DateTimePartsField() {
  return (
    <ComponentField>
      <span className="box small" />
      <span className="box small govuk-!-margin-left-1 govuk-!-margin-right-1" />
      <span className="box medium govuk-!-margin-right-1" />
      <span className="box small govuk-!-margin-right-1" />
      <span className="box small" />
    </ComponentField>
  );
}

function DatePartsField() {
  return (
    <ComponentField>
      <span className="box small" />
      <span className="box small govuk-!-margin-left-1 govuk-!-margin-right-1" />
      <span className="box medium" />
    </ComponentField>
  );
}

function RadiosField() {
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
}

function CheckboxesField() {
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
}

function SelectField() {
  return (
    <ComponentField>
      <div className="box dropdown" />
    </ComponentField>
  );
}

function YesNoField() {
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
}

function FileUploadField() {
  return (
    <ComponentField>
      <div className="govuk-!-margin-bottom-1">
        {"🗂"} <span className="line short" />
      </div>
    </ComponentField>
  );
}

function Details() {
  return (
    <Base>
      {"▶ "}
      <span className="line short" />
    </Base>
  );
}

function InsetText() {
  return (
    <Base>
      <div className="inset govuk-!-padding-left-2">
        <div className="line" />
        <div className="line short govuk-!-margin-bottom-2 govuk-!-margin-top-2" />
        <div className="line" />
      </div>
    </Base>
  );
}

function WarningText() {
  return (
    <Base>
      <div className="warning govuk-!-padding-left-2">
        <div className="line" />
        <div className="line short govuk-!-margin-bottom-2 govuk-!-margin-top-2" />
        <div className="line" />
      </div>
    </Base>
  );
}

function Para() {
  return (
    <Base>
      <div className="line" />
      <div className="line short govuk-!-margin-bottom-2 govuk-!-margin-top-2" />
      <div className="line" />
    </Base>
  );
}

function FlashCard() {
  return (
    <Base>
      <div className="line short govuk-!-margin-bottom-2 govuk-!-margin-top-2" />
      <div className="line" />
    </Base>
  );
}

function List() {
  return (
    <Base>
      <div className="line short govuk-!-margin-bottom-2 govuk-!-margin-top-2" />
      <div className="line short govuk-!-margin-bottom-2 govuk-!-margin-top-2" />
      <div className="line short govuk-!-margin-bottom-2 govuk-!-margin-top-2" />
    </Base>
  );
}

function Html() {
  return (
    <Base>
      <div className="html">
        <span className="line xshort govuk-!-margin-bottom-1 govuk-!-margin-top-1" />
      </div>
    </Base>
  );
}

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
