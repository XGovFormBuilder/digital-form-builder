import { List } from "@xgovformbuilder/model";
import { useContext } from "react";
import { DataContext } from "../../context";

export function UseFindList(name: List["name"]): List | undefined {
  const { data } = useContext(DataContext);
  return data.lists.find((list) => list.name === name);
}
