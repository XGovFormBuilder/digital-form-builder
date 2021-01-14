// @ts-nocheck

import {
  Coordinator,
  ConditionsModel,
  Condition,
  ConditionField,
  ConditionGroupDef,
  DateDirections,
  dateUnits,
  RelativeTimeValue,
  ConditionValue,
} from "../..";
import { ConditionRef } from "..";

describe("inline condition model", () => {
  let underTest;

  beforeEach(() => {
    underTest = new ConditionsModel();
  });

  describe("before adding the first condition", () => {
    test("should return an empty array", () => {
      expect(underTest.asPerUserGroupings).toEqual([]);
    });

    test("should return an empty presentation string", () => {
      expect(underTest.toPresentationString()).toEqual("");
    });

    test("should not have conditions", () => {
      expect(underTest.hasConditions).toEqual(false);
    });
  });

  describe("adding the first condition", () => {
    beforeEach(() => {
      underTest.add(
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Monkeys")
        )
      );
    });

    test("should have one item in the model", () => {
      expect(underTest.asPerUserGroupings).toEqual([
        {
          coordinator: undefined,
          field: { name: "badger", type: "TextField", display: "Badger" },
          operator: "is",
          value: { type: "Value", value: "Monkeys", display: "Monkeys" },
        },
      ]);
    });

    test("should return a human readable presentation string", () => {
      expect(underTest.toPresentationString()).toEqual("'Badger' is 'Monkeys'");
    });

    test("should return a valid expression string", () => {
      expect(underTest.toExpression()).toEqual("badger == 'Monkeys'");
    });

    test("should have conditions", () => {
      expect(underTest.hasConditions).toEqual(true);
    });
  });

  describe("multiple conditions with a simple and", () => {
    beforeEach(() => {
      underTest.add(
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Monkeys")
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("monkeys", "TextField", "Monkeys"),
          "is not",
          new ConditionValue("Giraffes"),
          Coordinator.AND
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is not",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
    });

    test("should have three items in the model", () => {
      expect(underTest.asPerUserGroupings).toEqual([
        {
          coordinator: undefined,
          field: { display: "Badger", type: "TextField", name: "badger" },
          operator: "is",
          value: { type: "Value", value: "Monkeys", display: "Monkeys" },
        },
        {
          coordinator: "and",
          field: { display: "Monkeys", type: "TextField", name: "monkeys" },
          operator: "is not",
          value: { type: "Value", value: "Giraffes", display: "Giraffes" },
        },
        {
          coordinator: "and",
          field: { display: "Squiffy", type: "TextField", name: "squiffy" },
          operator: "is not",
          value: { type: "Value", value: "Donkeys", display: "Donkeys" },
        },
      ]);
    });

    test("should return a human readable presentation string with all properties", () => {
      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Monkeys' and 'Monkeys' is not 'Giraffes' and 'Squiffy' is not 'Donkeys'"
      );
    });

    test("should return a valid expression", () => {
      expect(underTest.toExpression()).toEqual(
        "badger == 'Monkeys' and monkeys != 'Giraffes' and squiffy != 'Donkeys'"
      );
    });

    test("should have conditions", () => {
      expect(underTest.hasConditions).toEqual(true);
    });
  });

  describe("multiple conditions with a simple or", () => {
    beforeEach(() => {
      underTest.add(
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Monkeys")
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("monkeys", "TextField", "Monkeys"),
          "is not",
          new ConditionValue("Giraffes"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is not",
          new ConditionValue("Donkeys"),
          Coordinator.OR
        )
      );
    });

    test("should have three items in the model", () => {
      expect(underTest.asPerUserGroupings).toEqual([
        {
          coordinator: undefined,
          field: { display: "Badger", type: "TextField", name: "badger" },
          operator: "is",
          value: { type: "Value", value: "Monkeys", display: "Monkeys" },
        },
        {
          coordinator: "or",
          field: { display: "Monkeys", type: "TextField", name: "monkeys" },
          operator: "is not",
          value: { type: "Value", value: "Giraffes", display: "Giraffes" },
        },
        {
          coordinator: "or",
          field: { display: "Squiffy", type: "TextField", name: "squiffy" },
          operator: "is not",
          value: { type: "Value", value: "Donkeys", display: "Donkeys" },
        },
      ]);
    });

    test("should return a human readable presentation string with all properties", () => {
      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Monkeys' or 'Monkeys' is not 'Giraffes' or 'Squiffy' is not 'Donkeys'"
      );
    });

    test("should return a valid expression", () => {
      expect(underTest.toExpression()).toEqual(
        "badger == 'Monkeys' or monkeys != 'Giraffes' or squiffy != 'Donkeys'"
      );
    });
  });

  describe("or followed by and", () => {
    test("should return a human readable presentation string with all properties", () => {
      underTest.add(
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Zebras")
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("monkeys", "TextField", "Monkeys"),
          "is",
          new ConditionValue("Giraffes"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is not",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or ('Monkeys' is 'Giraffes' and 'Squiffy' is not 'Donkeys')"
      );
      expect(underTest.toExpression()).toEqual(
        "badger == 'Zebras' or (monkeys == 'Giraffes' and squiffy != 'Donkeys')"
      );
    });
  });

  describe("and followed by or", () => {
    test("should return a human readable presentation string with all properties", () => {
      underTest.add(
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Zebras")
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is not",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("monkeys", "TextField", "Monkeys"),
          "is",
          new ConditionValue("Giraffes"),
          Coordinator.OR
        )
      );
      expect(underTest.toPresentationString()).toEqual(
        "('Badger' is 'Zebras' and 'Squiffy' is not 'Donkeys') or 'Monkeys' is 'Giraffes'"
      );
      expect(underTest.toExpression()).toEqual(
        "(badger == 'Zebras' and squiffy != 'Donkeys') or monkeys == 'Giraffes'"
      );
    });
  });

  describe("complicated conditions", () => {
    beforeEach(() => {
      underTest.add(
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Zebras")
        )
      );
      underTest.add(new ConditionRef("under18", "Under 18", Coordinator.OR));
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("duration", "NumberField", "Duration"),
          "is at least",
          new ConditionValue("10"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("birthday", "DateField", "Birthday"),
          "is at least",
          new RelativeTimeValue("10", "days", DateDirections.PAST),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is not",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
    });

    test("should return a human readable presentation string with all properties", () => {
      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is at least '10 days in the past' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("should return a valid expression", () => {
      expect(underTest.toExpression()).toEqual(
        "badger == 'Zebras' or (under18 and squiffy == 'Donkeys') or duration >= 10 or (birthday <= dateForComparison(-10, 'days') and squiffy != 'Donkeys')"
      );
    });
  });

  describe("YesNoField", () => {
    beforeEach(() => {
      underTest.add(
        new Condition(
          new ConditionField("badger", "YesNoField", "Badger"),
          "is",
          new ConditionValue("true")
        )
      );
    });

    test("should return a valid expression with unquoted value", () => {
      expect(underTest.toExpression()).toEqual("badger == true");
    });
  });

  describe("replacing conditions", () => {
    beforeEach(() => {
      underTest.add(
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Monkeys")
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("monkeys", "TextField", "Monkeys"),
          "is not",
          new ConditionValue("Giraffes"),
          Coordinator.AND
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is not",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
    });

    test("should replace first condition without coordinator", () => {
      underTest.replace(
        0,
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Giraffes")
        )
      );
      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Giraffes' and 'Monkeys' is not 'Giraffes' and 'Squiffy' is not 'Donkeys'"
      );
    });

    test("should replace subsequent condition with coordinator", () => {
      underTest.replace(
        2,
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Giraffes"),
          Coordinator.AND
        )
      );
      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Monkeys' and 'Monkeys' is not 'Giraffes' and 'Badger' is 'Giraffes'"
      );
    });

    test("should not replace first condition with coordinator", () => {
      expect(() =>
        underTest.replace(
          0,
          new Condition(
            new ConditionField("badger", "TextField", "Badger"),
            "is",
            new ConditionValue("Giraffes"),
            Coordinator.AND
          )
        )
      ).toThrow(Error);
    });

    test("should not replace condition for index equal to conditions length", () => {
      expect(() =>
        underTest.replace(
          3,
          new Condition(
            new ConditionField("badger", "TextField", "Badger"),
            "is",
            new ConditionValue("Giraffes"),
            Coordinator.AND
          )
        )
      ).toThrow(Error);
    });

    test("should not replace condition for index greater than conditions length", () => {
      expect(() =>
        underTest.replace(
          4,
          new Condition(
            new ConditionField("badger", "TextField", "Badger"),
            "is",
            new ConditionValue("Giraffes"),
            Coordinator.AND
          )
        )
      ).toThrow(Error);
    });

    test("should not replace subsequent condition without coordinator", () => {
      expect(() =>
        underTest.replace(
          2,
          new Condition(
            new ConditionField("badger", "TextField", "Badger"),
            "is",
            new ConditionValue("Giraffes")
          )
        )
      ).toThrow(Error);
    });
  });

  describe("adding user generated groups", () => {
    beforeEach(() => {
      underTest.add(
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Zebras")
        )
      );
      underTest.add(new ConditionRef("under18", "Under 18", Coordinator.OR));
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("duration", "NumberField", "Duration"),
          "is at least",
          new ConditionValue("10"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("birthday", "DateField", "Birthday"),
          "is",
          new ConditionValue("10/10/2019"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is not",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
    });

    test("should apply defined group and auto-group the remaining conditions", () => {
      underTest.addGroups([new ConditionGroupDef(0, 1)]);
      expect(underTest.toPresentationString()).toEqual(
        "(('Badger' is 'Zebras' or 'Under 18') and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("should be able to apply group with single and condition and not need to clarify", () => {
      underTest.addGroups([new ConditionGroupDef(1, 2)]);
      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("should correctly auto-group multiple user groups together", () => {
      underTest.addGroups([
        new ConditionGroupDef(0, 1),
        new ConditionGroupDef(2, 3),
      ]);
      expect(underTest.toPresentationString()).toEqual(
        "(('Badger' is 'Zebras' or 'Under 18') and ('Squiffy' is 'Donkeys' or 'Duration' is at least '10')) or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("should correctly handle trailing and condition with existing groups", () => {
      underTest.addGroups([
        new ConditionGroupDef(0, 1),
        new ConditionGroupDef(2, 4),
      ]);
      expect(underTest.toPresentationString()).toEqual(
        "('Badger' is 'Zebras' or 'Under 18') and ('Squiffy' is 'Donkeys' or 'Duration' is at least '10' or 'Birthday' is '10/10/2019') and 'Squiffy' is not 'Donkeys'"
      );
    });

    test("should correctly clarify conditions inside user generated groups", () => {
      underTest.addGroups([
        new ConditionGroupDef(0, 2),
        new ConditionGroupDef(3, 5),
      ]);
      expect(underTest.toPresentationString()).toEqual(
        "('Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys')) or ('Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys'))"
      );
    });

    test("subsequent calls to addGroups should operate on the previously grouped entries", () => {
      underTest.addGroups([new ConditionGroupDef(0, 2)]);
      underTest.addGroups([new ConditionGroupDef(1, 2)]);
      expect(underTest.toPresentationString()).toEqual(
        "('Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys')) or (('Duration' is at least '10' or 'Birthday' is '10/10/2019') and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("subsequent calls to addGroups can create nested groups", () => {
      underTest.addGroups([new ConditionGroupDef(0, 1)]);
      underTest.addGroups([new ConditionGroupDef(0, 1)]);
      expect(underTest.toPresentationString()).toEqual(
        "(('Badger' is 'Zebras' or 'Under 18') and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("user groupings, but not automatic groupings, should be returned from asPerUserGroupings", () => {
      underTest.addGroups([new ConditionGroupDef(0, 1)]);
      underTest.addGroups([new ConditionGroupDef(0, 1)]);
      const returned = underTest.asPerUserGroupings;
      expect(returned).toEqual([
        {
          conditions: [
            {
              conditions: [
                {
                  coordinator: undefined,
                  field: {
                    display: "Badger",
                    type: "TextField",
                    name: "badger",
                  },
                  operator: "is",
                  value: { type: "Value", value: "Zebras", display: "Zebras" },
                },
                {
                  coordinator: "or",
                  conditionName: "under18",
                  conditionDisplayName: "Under 18",
                },
              ],
            },
            {
              coordinator: "and",
              field: { display: "Squiffy", type: "TextField", name: "squiffy" },
              operator: "is",
              value: { type: "Value", value: "Donkeys", display: "Donkeys" },
            },
          ],
        },
        {
          coordinator: "or",
          field: { display: "Duration", type: "NumberField", name: "duration" },
          operator: "is at least",
          value: { type: "Value", value: "10", display: "10" },
        },
        {
          coordinator: "or",
          field: { display: "Birthday", type: "DateField", name: "birthday" },
          operator: "is",
          value: { type: "Value", value: "10/10/2019", display: "10/10/2019" },
        },
        {
          coordinator: "and",
          field: { display: "Squiffy", type: "TextField", name: "squiffy" },
          operator: "is not",
          value: { type: "Value", value: "Donkeys", display: "Donkeys" },
        },
      ]);
    });
  });

  describe("splitting user generated groups", () => {
    beforeEach(() => {
      underTest.add(
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Zebras")
        )
      );
      underTest.add(new ConditionRef("under18", "Under 18", Coordinator.OR));
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("duration", "NumberField", "Duration"),
          "is at least",
          new ConditionValue("10"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("birthday", "DateField", "Birthday"),
          "is",
          new ConditionValue("10/10/2019"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is not",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
    });

    test("should split defined group and auto-group the remaining conditions", () => {
      underTest.addGroups([new ConditionGroupDef(0, 1)]);
      underTest.splitGroup(0);
      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("should split composite group and auto-group the remaining conditions", () => {
      underTest.addGroups([new ConditionGroupDef(0, 1)]);
      underTest.addGroups([new ConditionGroupDef(0, 1)]);
      underTest.splitGroup(0);
      expect(underTest.toPresentationString()).toEqual(
        "(('Badger' is 'Zebras' or 'Under 18') and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("should do nothing if trying to split a group that is not grouped", () => {
      underTest.splitGroup(0);
      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });
  });

  describe("removing conditions and groups", () => {
    beforeEach(() => {
      underTest.add(
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Zebras")
        )
      );
      underTest.add(new ConditionRef("under18", "Under 18", Coordinator.OR));
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("duration", "NumberField", "Duration"),
          "is at least",
          new ConditionValue("10"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("birthday", "DateField", "Birthday"),
          "is",
          new ConditionValue("10/10/2019"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is not",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
    });

    test("should remove the specified condition indexes", () => {
      underTest.remove([1, 4]);
      expect(underTest.asPerUserGroupings.length).toEqual(4);

      expect(underTest.toPresentationString()).toEqual(
        "('Badger' is 'Zebras' and 'Squiffy' is 'Donkeys') or ('Duration' is at least '10' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("should remove the only condition", () => {
      underTest.addGroups([new ConditionGroupDef(0, 5)]);
      underTest.remove([0]);
      expect(underTest.asPerUserGroupings.length).toEqual(0);
    });

    test("should allow removal of condition before group condition", () => {
      underTest.addGroups([new ConditionGroupDef(1, 2)]);
      underTest.remove([0]);
      expect(underTest.asPerUserGroupings.length).toEqual(4);
    });

    test("should remove all elements from a user-defined group", () => {
      expect(underTest.asPerUserGroupings.length).toEqual(6);
      underTest.addGroups([new ConditionGroupDef(0, 1)]);
      expect(underTest.asPerUserGroupings.length).toEqual(5);
      underTest.remove([0]);
      expect(underTest.asPerUserGroupings.length).toEqual(4);

      expect(underTest.toPresentationString()).toEqual(
        "'Squiffy' is 'Donkeys' or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("should remove all elements from a nested group", () => {
      expect(underTest.asPerUserGroupings.length).toEqual(6);
      underTest.addGroups([new ConditionGroupDef(0, 1)]);
      underTest.addGroups([new ConditionGroupDef(0, 1)]);
      expect(underTest.asPerUserGroupings.length).toEqual(4);
      underTest.remove([0]);
      expect(underTest.asPerUserGroupings.length).toEqual(3);

      expect(underTest.toPresentationString()).toEqual(
        "'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("should do nothing if provided invalid index to remove", () => {
      expect(underTest.asPerUserGroupings.length).toEqual(6);

      underTest.remove([6]);

      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });
  });

  describe("name", () => {
    test("should set and return name", () => {
      underTest.name = "some condition name";
      expect(underTest.name).toEqual("some condition name");
    });

    test("should overwrite name", () => {
      underTest.name = "some condition name";
      underTest.name = "some condition name 2";
      expect(underTest.name).toEqual("some condition name 2");
    });

    test("should return undefined if no name set", () => {
      expect(underTest.name).toEqual(undefined);
    });
  });

  describe("clone", () => {
    beforeEach(() => {
      underTest.name = "some condition name";
      underTest.add(
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Zebras")
        )
      );
      underTest.add(new ConditionRef("under18", "Under 18", Coordinator.OR));
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("duration", "NumberField", "Duration"),
          "is at least",
          new ConditionValue("10"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("birthday", "DateField", "Birthday"),
          "is",
          new ConditionValue("10/10/2019"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is not",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
    });

    test("should be cloned", () => {
      const returned = underTest.clone();
      expect(returned === underTest).toEqual(false);
      expect(returned).toEqual(underTest);

      const returnedCondition1 = returned.asPerUserGroupings[0];
      const underTestCondition1 = underTest.asPerUserGroupings[0];
      returnedCondition1.coordinator = "or";
      underTestCondition1.coordinator = undefined;
      expect(returnedCondition1).not.toEqual(underTestCondition1);
      expect(returned).toEqual(underTest);
    });
  });

  describe("clear", () => {
    beforeEach(() => {
      underTest.name = "some condition name";
      underTest.add(
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Zebras")
        )
      );
      underTest.add(new ConditionRef("under18", "Under 18", Coordinator.OR));
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("duration", "NumberField", "Duration"),
          "is at least",
          new ConditionValue("10"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("birthday", "DateField", "Birthday"),
          "is",
          new ConditionValue("10/10/2019"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is not",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
      underTest.addGroups([new ConditionGroupDef(0, 2)]);
    });

    test("should clear state", () => {
      const returned = underTest.clear();
      expect(returned === underTest).toEqual(true);
      expect(returned.hasConditions).toEqual(false);
      expect(returned.asPerUserGroupings).toEqual([]);
      expect(returned.name).toEqual(undefined);
      expect(returned.toPresentationString()).toEqual("");
    });
  });

  describe("moving conditions and groups", () => {
    beforeEach(() => {
      underTest.add(
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Zebras")
        )
      );
      underTest.add(new ConditionRef("under18", "Under 18", Coordinator.OR));
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("duration", "NumberField", "Duration"),
          "is at least",
          new ConditionValue("10"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("birthday", "DateField", "Birthday"),
          "is",
          new ConditionValue("10/10/2019"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is not",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
    });

    test("should move a condition earlier when not becoming the first item", () => {
      underTest.moveEarlier(3);

      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or 'Under 18' or ('Duration' is at least '10' and 'Squiffy' is 'Donkeys') or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("should move the last condition earlier", () => {
      underTest.moveEarlier(5);

      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys') or ('Duration' is at least '10' and 'Squiffy' is not 'Donkeys') or 'Birthday' is '10/10/2019'"
      );
    });

    test("should move a condition earlier and switch co-ordinators when becoming the first item", () => {
      underTest.moveEarlier(1);

      expect(underTest.toPresentationString()).toEqual(
        "'Under 18' or ('Badger' is 'Zebras' and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("should move a condition group earlier and switch co-ordinators when becoming the first item", () => {
      underTest.addGroups([new ConditionGroupDef(1, 2)]);
      underTest.moveEarlier(1);

      expect(underTest.toPresentationString()).toEqual(
        "('Under 18' and 'Squiffy' is 'Donkeys') or 'Badger' is 'Zebras' or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("move earlier does nothing when already the first item", () => {
      underTest.moveEarlier(0);

      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("move earlier does nothing when before the first item", () => {
      underTest.moveEarlier(-1);

      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("move earlier does nothing when after the last item", () => {
      underTest.moveEarlier(-1);

      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("move later does nothing when already the last item", () => {
      underTest.moveLater(5);

      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("move later does nothing when after the last item", () => {
      underTest.moveLater(6);

      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("move later does nothing when before the first item", () => {
      underTest.moveLater(-1);

      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("should move a condition later when not the first or last item", () => {
      underTest.moveLater(3);

      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys') or 'Birthday' is '10/10/2019' or ('Duration' is at least '10' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("should move penultimate condition later", () => {
      underTest.moveLater(4);

      expect(underTest.toPresentationString()).toEqual(
        "'Badger' is 'Zebras' or ('Under 18' and 'Squiffy' is 'Donkeys') or ('Duration' is at least '10' and 'Squiffy' is not 'Donkeys') or 'Birthday' is '10/10/2019'"
      );
    });

    test("should move a condition later and switch co-ordinators when moving the first item", () => {
      underTest.moveLater(0);

      expect(underTest.toPresentationString()).toEqual(
        "'Under 18' or ('Badger' is 'Zebras' and 'Squiffy' is 'Donkeys') or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });

    test("should move a condition group later and switch co-ordinators when moving the first item", () => {
      underTest.addGroups([new ConditionGroupDef(0, 1)]);
      underTest.moveLater(0);

      expect(underTest.toPresentationString()).toEqual(
        "('Squiffy' is 'Donkeys' and ('Badger' is 'Zebras' or 'Under 18')) or 'Duration' is at least '10' or ('Birthday' is '10/10/2019' and 'Squiffy' is not 'Donkeys')"
      );
    });
  });

  describe("invalid configuration", () => {
    describe("invalid operator", () => {
      test("should throw an error on condition creation if no operator provided", () => {
        expect(
          () =>
            new Condition(
              new ConditionField("badger", "TextField", "Badger"),
              null,
              new ConditionValue("Monkeys")
            )
        ).toThrow(Error);
      });

      test("should throw an error on condition creation if non-string operator provided", () => {
        expect(
          () =>
            new Condition(
              new ConditionField("badger", "TextField", "Badger"),
              {} as string,
              new ConditionValue("Monkeys")
            )
        ).toThrow(Error);
      });
    });

    describe("invalid field", () => {
      test("should throw an error on condition creation if no field provided", () => {
        expect(
          () => new Condition(null, "is", new ConditionValue("Monkeys"))
        ).toThrow(Error);
      });

      test("should throw an error on condition creation if field is not a ConditionField type", () => {
        expect(
          () =>
            new Condition(
              {} as ConditionField,
              "is",
              new ConditionValue("Monkeys")
            )
        ).toThrow(Error);
      });

      test("should throw an error on field creation if no value provided", () => {
        expect(() => new ConditionField(null, "TextField", "Badger")).toThrow(
          Error
        );
      });

      test("should throw an error on field creation if no type provided", () => {
        expect(() => new ConditionField("badger", undefined, "Badger")).toThrow(
          Error
        );
      });

      test("should throw an error on field creation if invalid type provided", () => {
        expect(
          () => new ConditionField("badger", "MadeUpType" as any, "Badger")
        ).toThrow(Error);
      });

      test("should throw an error on field creation if invalid name value type provided", () => {
        expect(
          () => new ConditionField({} as string, "TextField", "Badger")
        ).toThrow(Error);
      });

      test("should throw an error on field creation if invalid display value type provided", () => {
        expect(
          () => new ConditionField("Badger", "TextField", {} as string)
        ).toThrow(Error);
      });

      test("should throw an error on field creation if no display value provided", () => {
        expect(() => new ConditionField("badger", "TextField", null)).toThrow(
          Error
        );
      });

      test("should throw errors from factory method", () => {
        expect(() => ConditionField.from({ name: "badger" } as any)).toThrow(
          Error
        );
      });
    });

    describe("invalid value", () => {
      test("should throw an error on condition creation if no value provided", () => {
        expect(
          () =>
            new Condition(
              new ConditionField("badger", "TextField", "Badger"),
              "is",
              undefined,
              undefined
            )
        ).toThrow(Error);
      });

      test("should throw an error on condition creation if value is not a Value type", () => {
        expect(
          () =>
            new Condition(
              { value: "badger", display: "Badger" } as any,
              "is",
              "Monkeys" as any
            )
        ).toThrow(Error);
      });

      test("should throw an error on value creation if no value provided", () => {
        // @ts-ignore
        expect(() => new ConditionValue()).toThrow(Error);
      });

      test("should throw an error on value creation if display value is provided and is not a string", () => {
        expect(() => new ConditionValue("badger", {} as any)).toThrow(Error);
      });

      test("should throw an error on value creation if value is provided and is not a string", () => {
        expect(() => new ConditionValue({} as any, "Badger")).toThrow(Error);
      });

      test("should throw errors from factory method", () => {
        expect(() => ConditionValue.from({} as any)).toThrow(Error);
      });
    });

    describe("invalid coordinator", () => {
      test("should throw an error on condition creation if invalid coordinator provided", () => {
        expect(
          () =>
            new Condition(
              new ConditionField("badger", "TextField", "Badger"),
              "is",
              new ConditionValue("Monkeys"),
              "is" as Coordinator
            )
        ).toThrow(Error);
      });

      test("should throw an error on adding first condition if a coordinator is provided", () => {
        expect(() =>
          underTest.add(
            new Condition(
              new ConditionField("badger", "TextField", "Badger"),
              "is",
              new ConditionValue("Monkeys"),
              Coordinator.OR
            )
          )
        ).toThrow(Error);
      });

      test("should throw an error on adding subsequent condition if no coordinator is provided", () => {
        underTest.add(
          new Condition(
            new ConditionField("badger", "TextField", "Badger"),
            "is",
            new ConditionValue("Monkeys")
          )
        );
        expect(() =>
          underTest.add(
            new Condition(
              new ConditionField("badger", "TextField", "Badger"),
              "is",
              new ConditionValue("Monkeys")
            )
          )
        ).toThrow(Error);
      });
    });

    describe("invalid group def", () => {
      test("should throw error if there is no last value", () => {
        // @ts-ignore
        expect(() => new ConditionGroupDef(3)).toThrow(Error);
      });

      test("should throw error if there is no first value", () => {
        expect(() => new ConditionGroupDef(null, 3)).toThrow(Error);
      });

      test("should throw error if first > last", () => {
        expect(() => new ConditionGroupDef(4, 3)).toThrow(Error);
      });

      test("should throw error if first == last", () => {
        expect(() => new ConditionGroupDef(4, 4)).toThrow(Error);
      });
    });
  });

  describe("serialisation and deserialisation", () => {
    beforeEach(() => {
      underTest.name = "some condition name";
      underTest.add(
        new Condition(
          new ConditionField("badger", "TextField", "Badger"),
          "is",
          new ConditionValue("Zebras")
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("monkeys", "TextField", "Monkeys"),
          "is",
          new ConditionValue("giraffes", "Giraffes"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("duration", "NumberField", "Duration"),
          "is at least",
          new ConditionValue("10"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("birthday", "DateField", "Birthday"),
          "is",
          new ConditionValue("10/10/2019"),
          Coordinator.OR
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("reported", "DateField", "Reported"),
          "is more than",
          new RelativeTimeValue(
            "10",
            dateUnits.DAYS.value,
            DateDirections.PAST
          ),
          Coordinator.AND
        )
      );
      underTest.add(
        new Condition(
          new ConditionField("squiffy", "TextField", "Squiffy"),
          "is not",
          new ConditionValue("Donkeys"),
          Coordinator.AND
        )
      );
      underTest.add(
        new ConditionRef(
          "anotherCondition",
          "Another condition",
          Coordinator.OR
        )
      );
      underTest.addGroups([new ConditionGroupDef(0, 2)]);
    });

    test("serialising to json returns the expected result", () => {
      const expected = {
        name: "some condition name",
        conditions: [
          {
            conditions: [
              {
                field: { name: "badger", type: "TextField", display: "Badger" },
                operator: "is",
                value: { type: "Value", value: "Zebras", display: "Zebras" },
              },
              {
                coordinator: "or",
                field: {
                  name: "monkeys",
                  type: "TextField",
                  display: "Monkeys",
                },
                operator: "is",
                value: {
                  type: "Value",
                  value: "giraffes",
                  display: "Giraffes",
                },
              },
              {
                coordinator: "and",
                field: {
                  name: "squiffy",
                  type: "TextField",
                  display: "Squiffy",
                },
                operator: "is",
                value: { type: "Value", value: "Donkeys", display: "Donkeys" },
              },
            ],
          },
          {
            coordinator: "or",
            field: {
              name: "duration",
              type: "NumberField",
              display: "Duration",
            },
            operator: "is at least",
            value: { type: "Value", value: "10", display: "10" },
          },
          {
            coordinator: "or",
            field: { name: "birthday", type: "DateField", display: "Birthday" },
            operator: "is",
            value: {
              type: "Value",
              value: "10/10/2019",
              display: "10/10/2019",
            },
          },
          {
            coordinator: "and",
            field: { name: "reported", type: "DateField", display: "Reported" },
            operator: "is more than",
            value: {
              type: "RelativeTime",
              timePeriod: "10",
              timeUnit: dateUnits.DAYS.value,
              direction: DateDirections.PAST,
              timeOnly: false,
            },
          },
          {
            coordinator: "and",
            field: { name: "squiffy", type: "TextField", display: "Squiffy" },
            operator: "is not",
            value: { type: "Value", value: "Donkeys", display: "Donkeys" },
          },
          {
            coordinator: "or",
            conditionName: "anotherCondition",
            conditionDisplayName: "Another condition",
          },
        ],
      };
      expect(JSON.stringify(underTest)).toEqual(JSON.stringify(expected));
    });

    test("deserialising the serialised json returns a new ConditionsModel equal to the original", () => {
      const returned = ConditionsModel.from(
        JSON.parse(JSON.stringify(underTest))
      );
      expect(returned).toEqual(underTest);
      expect(returned.asPerUserGroupings).toEqual(underTest.asPerUserGroupings);
      expect(returned.toExpression()).toEqual(underTest.toExpression());
      expect(returned.toPresentationString()).toEqual(
        underTest.toPresentationString()
      );
      expect(returned === underTest).toEqual(false);
    });

    test("ConditionsModel.from with existing conditions model returns the passed object", () => {
      const returned = ConditionsModel.from(underTest);
      expect(returned).toEqual(underTest);
      expect(returned === underTest).toEqual(true);
    });
  });
});
