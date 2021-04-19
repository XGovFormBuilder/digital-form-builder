import { ConditionsWrapper } from "@xgovformbuilder/model/dist/browser/data-model";
import { useContext } from "react";
import { DataContext } from "../../context";

function UseFindCondition(
  name: ConditionsWrapper["name"]
): ConditionsWrapper | undefined {
  const { data } = useContext(DataContext);
  return data.conditions.find((condition) => condition.name === name);
}
