import { ConditionsWrapper } from "@xgovformbuilder/model/dist/browser/data-model";
import { useContext } from "react";
import { DataContext } from "../../context";

type ConditionName = Pick<ConditionsWrapper, "name">;
type ConditionDisplayName = Pick<ConditionsWrapper, "displayName">;
function UseFindCondition(
  name: ConditionsWrapper["name"]
): ConditionsWrapper | undefined {
  const { data } = useContext(DataContext);
  return data.conditions.find((condition) => condition.name === name);
}

function UseRemoveCondition(name: ConditionName) {}

function UseHasConditions(): boolean {
  return false;
}

function UpdateCondition(
  name: ConditionName,
  displayName: ConditionDisplayName
);
