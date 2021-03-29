import React from "react";

import ListsEdit from "../../list/ListsEdit";
import { ListContextProvider } from "../../reducers/listReducer";
import { ListsEditorContextProvider } from "../../reducers/list/listsEditorReducer";
import { RenderInPortal } from "../RenderInPortal";
import ComponentListSelect from "../ComponentListSelect/ComponentListSelect";

type Props = {
  page: any; // TODO
};

function ListFieldEdit({ page }: Props) {
  return (
    <ListsEditorContextProvider>
      <ListContextProvider>
        <ComponentListSelect />
        <RenderInPortal>
          <ListsEdit showEditLists={true} page={page} />
        </RenderInPortal>
      </ListContextProvider>
    </ListsEditorContextProvider>
  );
}

export default ListFieldEdit;
