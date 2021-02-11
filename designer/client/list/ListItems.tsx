import React, { useContext } from "react";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";
import { i18n, withI18n } from "../i18n";
import { ListActions } from "../reducers/listActions";
import {
  ListsEditorContext,
  ListsEditorStateActions,
  useSetListEditorContext,
} from "../reducers/list/listsEditorReducer";

import { DataContext } from "../context";
import { clone } from "@xgovformbuilder/model";
import { useListItem } from "../hooks/list/useListItem";

const DragHandle = SortableHandle(() => (
  <span className="drag-handle-list">&#9776;</span>
));

const SortableItem = SortableElement(({ item, removeItem, selectListItem }) => {
  return (
    <tr className="govuk-table__row" scope="row">
      <td className="govuk-table__cell" width="20px">
        <DragHandle />
      </td>
      <td className="govuk-table__cell">{item.text ?? item.label}</td>
      <td className="govuk-table__cell" width="50px">
        <a
          href="#"
          onClick={(e) => {
            e?.preventDefault();
            selectListItem(item);
          }}
        >
          Edit
        </a>
      </td>
      <td className="govuk-table__cell" width="50px">
        <a
          href="#"
          onClick={(e) => {
            e?.preventDefault();
            removeItem();
          }}
        >
          Delete
        </a>
      </td>
    </tr>
  );
});

const SortableList = SortableContainer(
  ({ items, selectListItem, removeItem }) => {
    return (
      <tbody className="govuk-table__body">
        {items.map((item, idx) => (
          <SortableItem
            key={`item-${idx}`}
            item={item}
            index={idx}
            selectListItem={selectListItem}
            removeItem={() => removeItem(idx)}
          />
        ))}
      </tbody>
    );
  }
);

function ListItems() {
  const { state: listEditorState, dispatch: listsEditorDispatch } = useContext(
    ListsEditorContext
  );
  const { isEditingStatic } = listEditorState;
  const { data, save } = useContext(DataContext);
  const { state, dispatch } = useSetListEditorContext();
  const selectedList = isEditingStatic
    ? state.selectedComponent.values
    : state.selectedList;

  const selectListItem = (payload) => {
    dispatch({ type: ListActions.EDIT_LIST_ITEM, payload });
    listsEditorDispatch([ListsEditorStateActions.IS_EDITING_LIST_ITEM, true]);
  };

  const { prepareForDelete } = useListItem(state, dispatch);

  function removeItem(index: number) {
    const copy = clone(data);
    save(prepareForDelete(copy, index));
  }

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const payload = { oldIndex, newIndex };
    if (!isEditingStatic) {
      dispatch({ type: ListActions.SORT_LIST_ITEM, payload });
    }
  };

  const hasListItems = (selectedList?.items ?? []).length > 0;

  return (
    <div>
      <table className="govuk-table">
        <caption className={"govuk-table__caption"}>
          {i18n("list.items.title")}
          <span className="govuk-hint govuk-!-margin-bottom-0">
            {i18n("list.items.hint")}
          </span>
        </caption>

        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th className="govuk-table__header" scope="col" />
            <th className="govuk-table__header" scope="col" />
            <th className="govuk-table__header" scope="col" />
            <th className="govuk-table__header" scope="col" />
          </tr>
        </thead>

        {!hasListItems && (
          <tbody className="govuk-table__body">
            <tr className="govuk-table__row" scope="row">
              <td className="govuk-body">{i18n("list.items.hintNoItems")}</td>
            </tr>
          </tbody>
        )}
        {hasListItems && (
          <SortableList
            items={selectedList?.items ?? []}
            selectListItem={selectListItem}
            removeItem={removeItem}
            onSortEnd={onSortEnd}
            helperClass="dragging-on-modal"
            hideSortableGhost={false}
            lockToContainerEdges
            useDragHandle
          />
        )}
      </table>
    </div>
  );
}

export default withI18n(ListItems);
