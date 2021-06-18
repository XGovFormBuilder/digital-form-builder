import React from "react";

import ListsEdit from "../../list/ListsEdit";
import { ListContextProvider } from "../../reducers/listReducer";
import { ListsEditorContextProvider } from "../../reducers/list/listsEditorReducer";
import { RenderInPortal } from "../RenderInPortal";
import ComponentListSelect from "../ComponentListSelect/ComponentListSelect";
import { i18n } from "../../i18n";
import { Autocomplete } from "../Autocomplete";
import ListFieldEdit from "./list-field-edit";

type Props = {
  page: any; // TODO
};

function SelectFieldEdit({ page }: Props) {
  return (
    <ListFieldEdit page={page}>
      <details className="govuk-details">
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">
            {i18n("common.detailsLink.title")}
          </span>
        </summary>

        <Autocomplete />
      </details>
    </ListFieldEdit>
  );
}

export default SelectFieldEdit;
