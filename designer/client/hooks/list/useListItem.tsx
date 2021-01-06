import { StaticListItem as StaticListItemActions } from "../../reducers/component/types";
import { ListActions } from "../../reducers/listActions";
import { ListsEditorContext } from "../../reducers/list/listsEditorReducer";
import { useContext } from "react";
import { clone } from "@xgovformbuilder/model";
import { hasValidationErrors, validateTitle } from "../../validations";

export type ListItemHook = {
  handleTitleChange: (e) => void;
  handleConditionChange: (e) => void;
  handleValueChange: (e) => void;
  handleHintChange: (e) => void;
  prepareForDelete: <T>(data: T, index?: number) => T;
  prepareForSubmit: <T>(data: T) => T;
  validate: (i18n: any) => boolean;
  value: any;
  condition: any;
  title: string;
  hint: string;
  isStaticList: boolean;
};

export function useListItemAdapter(state, dispatch): ListItemHook {
  const [{ isEditingStatic }] = useContext(ListsEditorContext);
  if (isEditingStatic) {
    return useStaticListItem(state, dispatch);
  } else {
    return useGlobalListItem(state, dispatch);
  }
}

export function useStaticListItem(state, dispatch): ListItemHook {
  const { selectedItem = {} } = state;
  const { value = "", condition } = selectedItem;

  function handleTitleChange(e) {
    dispatch({
      type: StaticListItemActions.STATIC_LIST_ITEM_EDIT_LABEL,
      payload: e.target.value,
    });
  }

  function handleConditionChange(e) {
    dispatch({
      type: StaticListItemActions.STATIC_LIST_ITEM_EDIT_CONDITION,
      payload: e.target.value,
    });
  }

  function handleValueChange(e) {
    dispatch({
      type: StaticListItemActions.STATIC_LIST_ITEM_EDIT_VALUE,
      payload: e.target.value,
    });
  }

  function handleHintChange(e) {
    dispatch({
      type: StaticListItemActions.STATIC_LIST_ITEM_EDIT_HINT,
      payload: e.target.value,
    });
  }

  function validate(i18n) {
    const title = state.selectedItem.label || "";
    const errors = validateTitle("title", title, i18n);
    const valErrors = hasValidationErrors(errors);
    if (valErrors) {
      dispatch({
        type: ListActions.LIST_ITEM_VALIDATION_ERRORS,
        payload: errors,
      });
    }
    return valErrors;
  }

  function prepareForSubmit(data) {
    const copy = clone(data);
    const { initialName, selectedItemIndex } = state;
    const { pagePath } = state;
    const component = copy.pages
      .find((page) => page.path === pagePath)
      .components.find((c) => c.name === initialName);

    if (selectedItem.isNew) {
      const { isNew, ...selectedItem } = state.selectedItem;
      const { values = { items: [] } } = state.selectedComponent;
      values.items.push(selectedItem);
      component.values = values;
    } else {
      component.values.items[selectedItemIndex] = selectedItem;
    }
    return copy.updateComponent(pagePath, initialName, component);
  }

  function prepareForDelete(data, index) {
    const copy = clone(data);
    const {
      selectedComponent: component,
      initialName,
      pagePath,
      selectedItemIndex,
    } = state;
    component.values.items.splice(selectedItemIndex ?? index, 1);
    copy.updateComponent(pagePath, initialName, component);
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
    title: selectedItem.label || "",
    hint: selectedItem.hint || "",
    isStaticList: true,
  };
}

export function useGlobalListItem(state, dispatch): ListItemHook {
  const { selectedItem = {} } = state;
  const { value = "", condition } = selectedItem;

  function handleTitleChange(e) {
    dispatch({
      type: ListActions.EDIT_LIST_ITEM_TEXT,
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

  function validate(i18n) {
    const title = state.selectedItem.text || "";
    const errors = validateTitle("title", title, i18n);
    const valErrors = hasValidationErrors(errors);
    if (valErrors) {
      dispatch({
        type: ListActions.LIST_ITEM_VALIDATION_ERRORS,
        payload: errors,
      });
    }
    return valErrors;
  }

  function prepareForSubmit(data) {
    const copy = clone(data);
    const { selectedList, selectedItemIndex, initialName } = state;
    let { items } = selectedList;
    if (!selectedItem.isNew) {
      items = items.splice(selectedItemIndex, 1, selectedItem);
    } else {
      const { isNew, errors, ...selectedItem } = state.selectedItem;
      items.push(selectedItem);
    }

    const indexOfList = copy.lists.findIndex(
      (list) => list.name === initialName
    );

    if (selectedList.isNew) {
      delete selectedList.isNew;
      copy.addList(selectedList);
    }

    const list = copy.lists[indexOfList];
    copy.lists[indexOfList] = { ...list, items };

    return copy;
  }

  function prepareForDelete(data, index) {
    const copy = clone(data);
    const { initialName, selectedList, selectedItemIndex } = state;
    selectedList.items.splice(selectedItemIndex ?? index, 1);
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
    isStaticList: false,
  };
}
