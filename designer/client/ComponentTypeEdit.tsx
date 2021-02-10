import React, { useContext } from "react";
import { ComponentTypes } from "@xgovformbuilder/model";
import { ComponentContext } from "./reducers/component/componentReducer";
import FieldEdit from "./field-edit";
import ListFieldEdit from "./components/FieldEditors/list-field-edit";
import { TextFieldEdit } from "./components/FieldEditors/text-field-edit";
import { MultilineTextFieldEdit } from "./multiline-text-field-edit";
import { FileUploadFieldEdit } from "./file-upload-field-edit";
import { NumberFieldEdit } from "./components/FieldEditors/number-field-edit";
import { DateFieldEdit } from "./components/FieldEditors/date-field-edit";
import { ParaEdit } from "./components/FieldEditors/para-edit";
import DetailsEdit from "./components/FieldEditors/details-edit";

const componentTypeEditors = {
  TextField: TextFieldEdit,
  EmailAddressField: TextFieldEdit,
  TelephoneNumberField: TextFieldEdit,
  MultilineTextField: MultilineTextFieldEdit,
  NumberField: NumberFieldEdit,
  AutocompleteField: ListFieldEdit,
  SelectField: ListFieldEdit,
  RadiosField: ListFieldEdit,
  CheckboxesField: ListFieldEdit,
  FlashCard: ListFieldEdit,
  List: ListFieldEdit,
  Details: DetailsEdit,
  Para: ParaEdit,
  Html: ParaEdit,
  InsetText: ParaEdit,
  WarningText: ParaEdit,
  FileUploadField: FileUploadFieldEdit,
  DatePartsField: DateFieldEdit,
  DateTimeField: DateFieldEdit,
  DateTimePartsField: DateFieldEdit,
  DateField: DateFieldEdit,
};

function ComponentTypeEdit(props) {
  const { context = ComponentContext, page } = props;
  const { state } = useContext(context);
  const { selectedComponent } = state;
  const type = ComponentTypes.find(
    (t) => t.name === selectedComponent?.type ?? ""
  );

  const needsFieldInputs =
    type?.subType !== "content" || ["FlashCard", "List"].includes(type?.name);

  const TagName = componentTypeEditors[type?.name ?? ""];

  return (
    <div>
      {needsFieldInputs && (
        <FieldEdit isContentField={type?.subType === "content"} />
      )}
      {TagName && <TagName page={page} />}
    </div>
  );
}

export default ComponentTypeEdit;
