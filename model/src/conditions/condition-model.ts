import { ConditionField } from "./condition-field";
import { ConditionGroupDef } from "./condition-group-def";
import { Condition } from "./condition";
import { ConditionRef } from "./condition-ref";
import { ConditionGroup } from "./condition-group";
import { conditionValueFrom } from "./condition-values";
import { toPresentationString, toExpression } from "./helpers";
import { Coordinator, ConditionsArray } from "./types";

type ConditionRawObject =
  | ConditionsModel
  | {
      name: string;
      conditions: Condition[];
    };

export class ConditionsModel {
  #groupedConditions: ConditionsArray = [];
  #userGroupedConditions: ConditionsArray = [];
  #conditionName: string | undefined = undefined;

  constructor(_conditionsObject?: ConditionRawObject) {}

  clone() {
    const toReturn = new ConditionsModel();
    toReturn.#groupedConditions = this.#groupedConditions.map((it) =>
      it.clone()
    );
    toReturn.#userGroupedConditions = this.#userGroupedConditions.map((it) =>
      it.clone()
    );
    toReturn.#conditionName = this.#conditionName;
    return toReturn;
  }

  clear() {
    this.#userGroupedConditions = [];
    this.#groupedConditions = [];
    this.#conditionName = undefined;
    return this;
  }

  set name(name) {
    this.#conditionName = name;
  }

  get name() {
    return this.#conditionName;
  }

  add(condition: Condition) {
    const coordinatorExpected = this.#userGroupedConditions.length !== 0;

    if (condition.getCoordinator() && !coordinatorExpected) {
      throw Error("No coordinator allowed on the first condition");
    } else if (!condition.getCoordinator() && coordinatorExpected) {
      throw Error("Coordinator must be present on subsequent conditions");
    }

    this.#userGroupedConditions.push(condition);
    this.#groupedConditions = this._applyGroups(this.#userGroupedConditions);

    return this;
  }

  replace(index: number, condition: Condition) {
    const coordinatorExpected = index !== 0;

    if (condition.getCoordinator() && !coordinatorExpected) {
      throw Error("No coordinator allowed on the first condition");
    } else if (!condition.getCoordinator() && coordinatorExpected) {
      throw Error("Coordinator must be present on subsequent conditions");
    } else if (index >= this.#userGroupedConditions.length) {
      throw Error(
        `Cannot replace condition ${index} as no such condition exists`
      );
    }

    this.#userGroupedConditions.splice(index, 1, condition);
    this.#groupedConditions = this._applyGroups(this.#userGroupedConditions);

    return this;
  }

  remove(indexes: number[]) {
    this.#userGroupedConditions = this.#userGroupedConditions
      .filter((_condition, index) => !indexes.includes(index))
      .map((condition, index) =>
        index === 0 ? condition.asFirstCondition() : condition
      );

    this.#groupedConditions = this._applyGroups(this.#userGroupedConditions);
    return this;
  }

  addGroups(groupDefs: ConditionGroupDef[]) {
    this.#userGroupedConditions = this._group(
      this.#userGroupedConditions,
      groupDefs
    );
    this.#groupedConditions = this._applyGroups(this.#userGroupedConditions);
    return this;
  }

  splitGroup(index: number) {
    this.#userGroupedConditions = this._ungroup(
      this.#userGroupedConditions,
      index
    );
    this.#groupedConditions = this._applyGroups(this.#userGroupedConditions);
    return this;
  }

  moveEarlier(index: number) {
    if (index > 0 && index < this.#userGroupedConditions.length) {
      this.#userGroupedConditions.splice(
        index - 1,
        0,
        this.#userGroupedConditions.splice(index, 1)[0]
      );
      if (index === 1) {
        this.switchCoordinators();
      }
      this.#groupedConditions = this._applyGroups(this.#userGroupedConditions);
    }
    return this;
  }

  moveLater(index: number) {
    if (index >= 0 && index < this.#userGroupedConditions.length - 1) {
      this.#userGroupedConditions.splice(
        index + 1,
        0,
        this.#userGroupedConditions.splice(index, 1)[0]
      );
      if (index === 0) {
        this.switchCoordinators();
      }
      this.#groupedConditions = this._applyGroups(this.#userGroupedConditions);
    }
    return this;
  }

  switchCoordinators() {
    this.#userGroupedConditions[1].setCoordinator(
      this.#userGroupedConditions[0].getCoordinator()
    );
    this.#userGroupedConditions[0].setCoordinator(undefined);
  }

  get asPerUserGroupings() {
    return [...this.#userGroupedConditions];
  }

  get hasConditions() {
    return this.#userGroupedConditions.length > 0;
  }

  get lastIndex() {
    return this.#userGroupedConditions.length - 1;
  }

  toPresentationString() {
    return this.#groupedConditions
      .map((condition) => toPresentationString(condition))
      .join(" ");
  }

  toExpression() {
    return this.#groupedConditions
      .map((condition) => toExpression(condition))
      .join(" ");
  }

  _applyGroups(
    userGroupedConditions: (Condition | ConditionGroup | ConditionRef)[]
  ) {
    const correctedUserGroups = userGroupedConditions.map((condition) =>
      condition instanceof ConditionGroup && condition.conditions.length > 2
        ? new ConditionGroup(
            this._group(
              condition.conditions,
              this._autoGroupDefs(condition.conditions)
            )
          )
        : condition
    );

    return this._group(
      correctedUserGroups,
      this._autoGroupDefs(correctedUserGroups)
    );
  }

  _group(conditions: ConditionsArray, groupDefs: ConditionGroupDef[]) {
    return conditions.reduce((groups, condition, index, conditions) => {
      const groupDef = groupDefs.find((groupDef) => groupDef.contains(index));

      if (groupDef) {
        if (groupDef.startsWith(index)) {
          const groupConditions = groupDef.applyTo(conditions);
          groups.push(new ConditionGroup(groupConditions));
        }
      } else {
        groups.push(condition);
      }

      return groups;
    }, [] as ConditionsArray);
  }

  _ungroup(conditions: ConditionsArray, splitIndex: number) {
    if (conditions[splitIndex].isGroup()) {
      const copy = [...conditions];
      copy.splice(
        splitIndex,
        1,
        ...conditions[splitIndex].getGroupedConditions()
      );
      return copy;
    }
    return conditions;
  }

  _autoGroupDefs(conditions: ConditionsArray) {
    const orPositions: number[] = [];

    conditions.forEach((condition, index) => {
      if (condition.getCoordinator() === Coordinator.OR) {
        orPositions.push(index);
      }
    });

    const hasOr = orPositions.length > 0;
    const hasAnd = !!conditions.find(
      (condition) => condition.getCoordinator() === Coordinator.AND
    );

    if (hasAnd && hasOr) {
      let start = 0;
      const groupDefs: ConditionGroupDef[] = [];
      orPositions.forEach((position, index) => {
        if (start < position - 1) {
          groupDefs.push(new ConditionGroupDef(start, position - 1));
        }
        const thisIsTheLastOr = orPositions.length === index + 1;
        const thereAreMoreConditions = conditions.length - 1 > position;
        if (thisIsTheLastOr && thereAreMoreConditions) {
          groupDefs.push(
            new ConditionGroupDef(position, conditions.length - 1)
          );
        }
        start = position;
      });
      return groupDefs;
    }

    return [];
  }

  toJSON() {
    const name = this.#conditionName;
    const conditions = this.#userGroupedConditions;
    return {
      name: name,
      conditions: conditions.map((it) => it.clone()),
    };
  }

  //TODO:- why is this not a constructor?
  static from(obj: ConditionRawObject | ConditionsModel) {
    if (obj instanceof ConditionsModel) {
      return obj;
    }
    const toReturn = new ConditionsModel();
    toReturn.#conditionName = obj.name;
    toReturn.#userGroupedConditions = obj.conditions.map((condition) =>
      conditionFrom(condition)
    );
    toReturn.#groupedConditions = toReturn._applyGroups(
      toReturn.#userGroupedConditions
    );
    return toReturn;
  }
}

interface ConditionFrom {
  (it: Condition | ConditionRef | ConditionGroup):
    | Condition
    | ConditionRef
    | ConditionGroup;
}

const conditionFrom: ConditionFrom = function (it) {
  if ("conditions" in it) {
    return new ConditionGroup(
      (it as ConditionGroup).conditions.map((condition) =>
        conditionFrom(condition)
      )
    );
  }

  if ("conditionName" in it) {
    return new ConditionRef(
      it.conditionName,
      it.conditionDisplayName,
      it.coordinator
    );
  }

  return new Condition(
    ConditionField.from(it.field),
    it.operator,
    conditionValueFrom(it.value),
    it.coordinator
  );
};
