import React, { useContext } from "react";
import { ComponentTypes } from "@xgovformbuilder/model";
import { ComponentContext } from "./reducers/component/componentReducer";
import FieldEdit from "./field-edit";
import ListFieldEdit from "./component-editors/list-field-edit";
import { TextFieldEdit } from "./component-editors/text-field-edit";
import { MultilineTextFieldEdit } from "./multiline-text-field-edit";
import { FileUploadFieldEdit } from "./file-upload-field-edit";
import { NumberFieldEdit } from "./component-editors/number-field-edit";
import { DateFieldEdit } from "./component-editors/date-field-edit";
import { ParaEdit } from "./component-editors/para-edit";
import DetailsEdit from "./component-editors/details-edit";

const componentTypeEditors = {
  TextFieldEdit: TextFieldEdit,
  EmailAddressFieldEdit: TextFieldEdit,
  TelephoneNumberFieldEdit: TextFieldEdit,
  NumberFieldEdit: NumberFieldEdit,
  MultilineTextFieldEdit: MultilineTextFieldEdit,
  AutocompleteFieldEdit: ListFieldEdit,
  SelectFieldEdit: ListFieldEdit,
  RadiosFieldEdit: ListFieldEdit,
  CheckboxesFieldEdit: ListFieldEdit,
  ParaEdit: ParaEdit,
  HtmlEdit: ParaEdit,
  InsetTextEdit: ParaEdit,
  WarningTextEdit: ParaEdit,
  DetailsEdit: DetailsEdit,
  FlashCardEdit: ListFieldEdit,
  FileUploadFieldEdit,
  DatePartsFieldEdit: DateFieldEdit,
  ListEdit: ListFieldEdit,
};

function ComponentTypeEdit(props) {
  const { context = ComponentContext, page } = props;
  const [{ selectedComponent }] = useContext(context);
  const type = ComponentTypes.find(
    (t) => t.name === selectedComponent?.type ?? ""
  );

  const needsFieldInputs = type?.subType !== "content";
  const TagName =
    componentTypeEditors[`${selectedComponent?.type}Edit`] || FieldEdit;
  return (
    <>
      {needsFieldInputs && <FieldEdit page={page} context={context} />}
      {type && <TagName page={page} context={context} />}
    </>
  );
}

export default ComponentTypeEdit;
