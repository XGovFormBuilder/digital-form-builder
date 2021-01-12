import React from "react";

import ListsEdit from "../../list/lists-edit";
import { ListContextProvider } from "../../reducers/listReducer";
import { ListsEditorContextProvider } from "../../reducers/list/listsEditorReducer";
import { RenderInPortal } from "../RenderInPortal";
import ComponentListSelect from "../../list/component-list-select";

type Props = {
  page: any; // TODO
};

function ListFieldEdit({ page }: Props) {
  return (
    <ListsEditorContextProvider>
      <ListContextProvider>
        <ComponentListSelect />
        <RenderInPortal>
          <ListsEdit isEditingFromComponent={true} page={page} />
        </RenderInPortal>
      </ListContextProvider>
    </ListsEditorContextProvider>
  );
}

export default ListFieldEdit;
