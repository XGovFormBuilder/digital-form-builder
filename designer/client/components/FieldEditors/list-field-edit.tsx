import React from "react";

import ListsEdit from "../../list/ListsEdit";
import { ListContextProvider } from "../../reducers/listReducer";
import { ListsEditorContextProvider } from "../../reducers/list/listsEditorReducer";
import { RenderInPortal } from "../RenderInPortal";
import ComponentListSelect from "../ComponentListSelect/ComponentListSelect";

type Props = {
  children: any; // TODO
  page: any; // TODO
};

function ListFieldEdit({ children, page }: Props) {
  return (
    <ListsEditorContextProvider>
      <ListContextProvider>
        <ComponentListSelect />
        {children}
        <RenderInPortal>
          <ListsEdit showEditLists={true} page={page} />
        </RenderInPortal>
      </ListContextProvider>
    </ListsEditorContextProvider>
  );
}

export default ListFieldEdit;
