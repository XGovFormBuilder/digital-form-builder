import { ListsEditorContext } from "../../../reducers/list/listsEditorReducer";
import { useContext } from "react";
import { useGlobalListItem } from "./useGlobalListItem";
import { useStaticListItem } from "./useStaticListItem";
import { ListItemHook } from "./types";

export function useListItem(state, dispatch): ListItemHook {
  const [{ isEditingStatic }] = useContext(ListsEditorContext);
  if (isEditingStatic) {
    return useStaticListItem(state, dispatch);
  } else {
    return useGlobalListItem(state, dispatch);
  }
}
