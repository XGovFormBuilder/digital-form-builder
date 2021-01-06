import React from "react";

import ListsEdit from "../list/lists-edit";
import { ListContextProvider } from "../reducers/listReducer";
import { ListsEditorContextProvider } from "../reducers/list/listsEditorReducer";
import { RenderInPortal } from "../components/render-in-portal";
import ComponentListSelect from "../list/component-list-select";

function ListFieldEdit(props) {
  return (
    <ListsEditorContextProvider>
      <ListContextProvider>
        <ComponentListSelect />
        <RenderInPortal>
          <ListsEdit isEditingFromComponent={true} page={props.page} />
        </RenderInPortal>
      </ListContextProvider>
    </ListsEditorContextProvider>
  );
}

export default ListFieldEdit;
