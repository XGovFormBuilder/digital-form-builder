import React, { useContext } from "react";
import ListEdit from "./ListEdit";
import { RenderInPortal } from "../components/RenderInPortal";
import { Flyout } from "../components/Flyout";
import ListItemEdit from "./ListItemEdit";
import GlobalListSelect from "./GlobalListSelect";
import {
  ListsEditorContext,
  ListsEditorStateActions,
} from "../reducers/list/listsEditorReducer";
import { Warning } from "./Warning";
import { i18n } from "./../i18n";

type Props = {
  isEditingFromComponent: boolean;
};

const useListsEdit = () => {
  const { state: listEditState, dispatch: listsEditorDispatch } = useContext(
    ListsEditorContext
  );

  const {
    isEditingList,
    isEditingListItem,
    showWarning,
    listEditContext,
  } = listEditState;

  const { state } = useContext(listEditContext);
  const { selectedList, selectedItem } = state;

  const closeFlyout = (action: ListsEditorStateActions) => {
    return () => listsEditorDispatch([action, false]);
  };

  const listTitle = selectedList?.isNew
    ? i18n("list.add")
    : i18n("list.edit", {
        title: state.initialTitle ?? selectedList?.title ?? selectedList?.name,
      });

  const itemTitle = selectedItem?.isNew
    ? i18n("list.item.add")
    : i18n("list.item.edit", {
        title: selectedItem?.title,
      });

  return {
    isEditingList,
    isEditingListItem,
    showWarning,
    selectedList,
    selectedItem,
    closeFlyout,
    listTitle,
    itemTitle,
  };
};

export function ListsEdit({ isEditingFromComponent = false }: Props) {
  const {
    isEditingList,
    isEditingListItem,
    showWarning,
    closeFlyout,
    listTitle,
    itemTitle,
  } = useListsEdit();

  return (
    <div className="govuk-body">
      {!isEditingFromComponent && <GlobalListSelect />}

      {isEditingList && (
        <RenderInPortal>
          <Flyout
            title={listTitle}
            onHide={closeFlyout(ListsEditorStateActions.IS_EDITING_LIST)}
            width={""}
          >
            {showWarning && <Warning />}
            <ListEdit />
          </Flyout>
        </RenderInPortal>
      )}

      {isEditingListItem && (
        <RenderInPortal>
          <Flyout
            title={itemTitle}
            width={""}
            onHide={closeFlyout(ListsEditorStateActions.IS_EDITING_LIST_ITEM)}
          >
            <ListItemEdit />
          </Flyout>
        </RenderInPortal>
      )}
    </div>
  );
}

export default ListsEdit;
