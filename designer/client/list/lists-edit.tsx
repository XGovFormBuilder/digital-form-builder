import React, { useContext, useEffect } from "react";
import ListEdit from "./ListEdit";
import { RenderInPortal } from "../components/render-in-portal";
import Flyout from "./../flyout";
import { withI18n } from "./../i18n";
import ListItemEdit from "./list-item-edit";
import GlobalListSelect from "./global-list-select";
import ComponentListSelect from "./component-list-select";
import {
  ListsEditorContext,
  ListsEditorStateActions,
  useSetListEditorContext,
} from "../reducers/list/listsEditorReducer";
import Warning from "./Warning";

type Props = {
  isEditingFromComponent: boolean;
  i18n?: any;
};

const useListsEdit = (props) => {
  const { isEditingFromComponent = false, i18n } = props;

  const [
    { isEditingList, isEditingListItem, showWarning, context },
    listsEditorDispatch,
  ]: any = useContext(ListsEditorContext);

  const [{ selectedList, selectedItem }]: any = useContext(context);

  const closeFlyout = (action: ListsEditorStateActions) => {
    return () => listsEditorDispatch([action, false]);
  };

  const listTitle = selectedList?.isNew
    ? i18n("list.newTitle")
    : i18n("list.editingTitle", {
        title:
          (selectedList?.title ?? selectedList?.name) ||
          i18n("list.static.noun"),
      });

  const itemTitle = selectedItem?.isNew
    ? i18n("list.item.newTitle")
    : i18n("list.item.editing", {
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

export function ListsEdit(props: Props) {
  const { isEditingFromComponent, i18n } = props;
  const {
    isEditingList,
    isEditingListItem,
    showWarning,
    closeFlyout,
    listTitle,
    itemTitle,
  } = useListsEdit(props);
  return (
    <div className="govuk-body">
      {!isEditingFromComponent && <GlobalListSelect />}

      {isEditingList && (
        <RenderInPortal>
          <Flyout
            title={listTitle}
            onHide={closeFlyout(ListsEditorStateActions.IS_EDITING_LIST)}
            width={""}
            show={isEditingList}
          >
            {showWarning && <Warning />}
            <ListEdit isEditingFromComponent={isEditingFromComponent} />
          </Flyout>
        </RenderInPortal>
      )}

      {isEditingListItem && (
        <RenderInPortal>
          <Flyout
            title={itemTitle}
            show={true}
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

export default withI18n(ListsEdit);
