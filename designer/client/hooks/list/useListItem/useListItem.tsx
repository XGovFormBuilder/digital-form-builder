import { ListActions } from "../../../reducers/listActions";
import {
  hasValidationErrors,
  validateNotEmpty,
  validateTitle,
} from "../../../validations";
import { clone, FormDefinition } from "@xgovformbuilder/model";
import { ListItemHook } from "./types";
import { addList, findList } from "../../../data";

export function useListItem(state, dispatch): ListItemHook {
  const { selectedItem = {} } = state;
  let { value = "", condition } = selectedItem;

  function handleTitleChange(e) {
    dispatch({
      type: ListActions.EDIT_LIST_ITEM_TEXT,
      payload: e.target.value,
    });
    dispatch({
      type: ListActions.EDIT_LIST_ITEM_VALUE,
      payload: e.target.value,
    });
  }

  function handleConditionChange(e) {
    dispatch({
      type: ListActions.EDIT_LIST_ITEM_CONDITION,
      payload: e.target.value,
    });
  }

  function handleValueChange(e) {
    dispatch({
      type: ListActions.EDIT_LIST_ITEM_VALUE,
      payload: e.target.value,
    });
  }

  function handleHintChange(e) {
    dispatch({
      type: ListActions.EDIT_LIST_ITEM_DESCRIPTION,
      payload: e.target.value,
    });
  }

  function validate(i18nProp) {
    const title = state.selectedItem.text || "";
    const errors = {
      ...validateTitle("title", title, i18nProp),
      ...validateNotEmpty("value", "value", "value", value),
    };

    const valErrors = hasValidationErrors(errors);

    if (valErrors) {
      dispatch({
        type: ListActions.LIST_ITEM_VALIDATION_ERRORS,
        payload: errors,
      });
    }
    return valErrors;
  }

  function prepareForSubmit(data: FormDefinition) {
    let copy: FormDefinition = { ...data };
    const { selectedList, selectedItemIndex } = state;
    let { items } = selectedList;
    if (!selectedItem.isNew) {
      items = items.splice(selectedItemIndex, 1, selectedItem);
    } else {
      const { isNew, errors, ...selectedItem } = state.selectedItem;
      items.push(selectedItem);
    }

    if (selectedList.isNew) {
      delete selectedList.isNew;
      copy = addList(data, selectedList);
    } else {
      const [list, indexOfList] = findList(copy, selectedList.name);
      copy.lists[indexOfList] = { ...list, items };
    }
    return copy;
  }

  function prepareForDelete(data: any, index: number | undefined) {
    const copy = { ...data };
    const { initialName, selectedList, selectedItemIndex } = state;

    // If user clicks delete button in list items list, then index is defined and we use it
    // If user clicks delete button inside item edit screen, then selectedItemIndex is defined and index is undefined
    const itemToDelete = index ?? selectedItemIndex;
    selectedList.items.splice(itemToDelete, 1);

    const selectedListIndex = copy.lists.findIndex(
      (list) => list.name === initialName
    );
    copy.lists[selectedListIndex] = selectedList;

    return copy;
  }

  return {
    handleTitleChange,
    handleConditionChange,
    handleValueChange,
    handleHintChange,
    prepareForSubmit,
    prepareForDelete,
    validate,
    value,
    condition,
    title: selectedItem.text || "",
    hint: selectedItem.description || "",
  };
}
