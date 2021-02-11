import { StaticListItem as StaticListItemActions } from "../../../reducers/component/types";
import {
  hasValidationErrors,
  validateNotEmpty,
  validateTitle,
} from "../../../validations";
import { ListActions } from "../../../reducers/listActions";
import { clone } from "@xgovformbuilder/model";
import { ListItemHook } from "./types";

/**
 * @deprecated
 * This feature will be removed and replaced with Global Lists.
 */
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

  function validate() {
    const title = state.selectedItem.label || "";
    const errors = {
      ...validateTitle("title", title),
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

  function prepareForSubmit(data) {
    const copy = clone(data);
    const { initialName, selectedItemIndex } = state;
    const { pagePath } = state;
    const component = copy.pages
      .find((page) => page.path === pagePath)
      .components.find((c) => c.name === initialName);

    if (selectedItem.isNew) {
      const { isNew, ...selectedItem } = state.selectedItem;
      const {
        values = { type: "static", items: [] },
      } = state.selectedComponent;
      values.items.push(selectedItem);
      component.values = values;
    } else {
      component.values.items[selectedItemIndex] = selectedItem;
    }
    return copy.updateComponent(pagePath, initialName, component);
  }

  function prepareForDelete(data: any, index: number | undefined) {
    const copy = clone(data);
    const {
      selectedComponent: component,
      initialName,
      pagePath,
      selectedItemIndex,
    } = state;

    // If user clicks delete button in list items list, then index is defined and we use it
    // If user clicks delete button inside item edit screen, then selectedItemIndex is defined and index is undefined
    const itemToDelete = index !== undefined ? index : selectedItemIndex;
    component.values.items.splice(itemToDelete, 1);
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
