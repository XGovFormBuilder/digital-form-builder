import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import {
  ComponentTypes,
  getExpression,
  getOperatorNames,
  DateDirections,
  dateUnits,
  timeUnits,
  ConditionValue,
  RelativeTimeValue,
} from "@xgovformbuilder/model";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, describe, test } = lab;

suite("Inline condition operators", () => {
  const inputFieldComponents = ComponentTypes.filter(
    (it) => it.subType === "field"
  );

  function dateTimeOperatorExpectations(futureUnit, pastUnit) {
    return timeShiftOperatorExpectations(
      futureUnit,
      pastUnit,
      "dateForComparison"
    );
  }

  function timeOperatorExpectations(futureUnit, pastUnit) {
    return timeShiftOperatorExpectations(
      futureUnit,
      pastUnit,
      "timeForComparison",
      true
    );
  }

  function timeShiftOperatorExpectations(
    futureUnit,
    pastUnit,
    functionName,
    timeOnly
  ) {
    const timePeriod = `${Math.max(Math.floor(Math.random() * 100), 1)}`;
    return [
      {
        testValue: new RelativeTimeValue(
          timePeriod,
          futureUnit,
          DateDirections.FUTURE,
          timeOnly
        ),
        operators: {
          "is at least": (field) =>
            `${field} >= ${functionName}(${timePeriod}, '${futureUnit}')`,
          "is at most": (field) =>
            `${field} <= ${functionName}(${timePeriod}, '${futureUnit}')`,
          "is less than": (field) =>
            `${field} < ${functionName}(${timePeriod}, '${futureUnit}')`,
          "is more than": (field) =>
            `${field} > ${functionName}(${timePeriod}, '${futureUnit}')`,
        },
      },
      {
        testValue: new RelativeTimeValue(
          timePeriod,
          pastUnit,
          DateDirections.PAST,
          timeOnly
        ),
        operators: {
          "is at least": (field) =>
            `${field} <= ${functionName}(-${timePeriod}, '${pastUnit}')`,
          "is at most": (field) =>
            `${field} >= ${functionName}(-${timePeriod}, '${pastUnit}')`,
          "is less than": (field) =>
            `${field} > ${functionName}(-${timePeriod}, '${pastUnit}')`,
          "is more than": (field) =>
            `${field} < ${functionName}(-${timePeriod}, '${pastUnit}')`,
        },
      },
      {
        operators: {
          is: (field, value) => `${field} == '${value.value}'`,
          "is after": (field, value) => `${field} > '${value.value}'`,
          "is before": (field, value) => `${field} < '${value.value}'`,
          "is not": (field, value) => `${field} != '${value.value}'`,
        },
      },
    ];
  }

  // I expect this list to grow as time goes on.
  const componentTypesWithCustomValidators = {
    NumberField: {
      cases: [
        {
          operators: {
            is: (field, value) => `${field} == ${value.value}`,
            "is at least": (field, value) => `${field} >= ${value.value}`,
            "is at most": (field, value) => `${field} <= ${value.value}`,
            "is less than": (field, value) => `${field} < ${value.value}`,
            "is more than": (field, value) => `${field} > ${value.value}`,
            "is not": (field, value) => `${field} != ${value.value}`,
          },
        },
      ],
    },
    DateField: {
      cases: dateTimeOperatorExpectations(
        dateUnits.MONTHS.value,
        dateUnits.DAYS.value
      ),
    },
    DatePartsField: {
      cases: dateTimeOperatorExpectations(
        dateUnits.YEARS.value,
        dateUnits.DAYS.value
      ),
    },
    TimeField: {
      cases: timeOperatorExpectations(
        timeUnits.HOURS.value,
        timeUnits.SECONDS.value
      ),
    },
    DateTimeField: {
      cases: dateTimeOperatorExpectations(
        dateUnits.YEARS.value,
        timeUnits.SECONDS.value
      ),
    },
    DateTimePartsField: {
      cases: dateTimeOperatorExpectations(
        dateUnits.YEARS.value,
        timeUnits.MINUTES.value
      ),
    },
    // here because the formatting of value is different to the standard quoted string
    YesNoField: {
      cases: [
        {
          operators: {
            is: (field, value) => `${field} == ${value.value}`,
            "is not": (field, value) => `${field} != ${value.value}`,
          },
        },
      ],
    },
    CheckboxesField: {
      cases: [
        {
          operators: {
            contains: (field, value) => `'${value.value}' in ${field}`,
            "does not contain": (field, value) =>
              `not ('${value.value}' in ${field})`,
          },
        },
      ],
    },
    TextField: {
      cases: [
        {
          operators: {
            "has length": (field, value) =>
              `length(${field}) == ${value.value}`,
            is: (field, value) => `${field} == '${value.value}'`,
            "is longer than": (field, value) =>
              `length(${field}) > ${value.value}`,
            "is not": (field, value) => `${field} != '${value.value}'`,
            "is shorter than": (field, value) =>
              `length(${field}) < ${value.value}`,
          },
        },
      ],
    },
    MultilineTextField: {
      cases: [
        {
          operators: {
            "has length": (field, value) =>
              `length(${field}) == ${value.value}`,
            is: (field, value) => `${field} == '${value.value}'`,
            "is longer than": (field, value) =>
              `length(${field}) > ${value.value}`,
            "is not": (field, value) => `${field} != '${value.value}'`,
            "is shorter than": (field, value) =>
              `length(${field}) < ${value.value}`,
          },
        },
      ],
    },
    FreeTextField: {
      cases: [
        {
          operators: {
            "has length": (field, value) =>
              `length(${field}) == ${value.value}`,
            is: (field, value) => `${field} == '${value.value}'`,
            "is longer than": (field, value) =>
              `length(${field}) > ${value.value}`,
            "is not": (field, value) => `${field} != '${value.value}'`,
            "is shorter than": (field, value) =>
              `length(${field}) < ${value.value}`,
          },
        },
      ],
    },
    EmailAddressField: {
      cases: [
        {
          operators: {
            "has length": (field, value) =>
              `length(${field}) == ${value.value}`,
            is: (field, value) => `${field} == '${value.value}'`,
            "is longer than": (field, value) =>
              `length(${field}) > ${value.value}`,
            "is not": (field, value) => `${field} != '${value.value}'`,
            "is shorter than": (field, value) =>
              `length(${field}) < ${value.value}`,
          },
        },
      ],
    },
  };

  const defaultValidators = {
    is: (field, value) => `${field} == '${value.value}'`,
    "is not": (field, value) => `${field} != '${value.value}'`,
  };

  describe("getOperatorNames", () => {
    inputFieldComponents
      .filter(
        (it) =>
          !Object.keys(componentTypesWithCustomValidators).includes(it.name)
      )
      .forEach((type) => {
        test(`should apply default operators for ${type.name}`, () => {
          const operatorNames = getOperatorNames(type.name);
          expect(operatorNames).to.equal(Object.keys(defaultValidators));
        });
      });

    Object.keys(componentTypesWithCustomValidators).forEach((type) => {
      test(`should apply expected operators for ${type}`, () => {
        const operatorNames = getOperatorNames(type);
        const expectedOperatorNames = Object.keys(
          componentTypesWithCustomValidators[type].cases.reduce(
            (previousValue, testCase) => {
              return Object.assign(previousValue, testCase.operators);
            },
            {}
          )
        ).sort();
        expect(operatorNames).to.equal(expectedOperatorNames);
      });
    });
  });

  describe("getExpression", () => {
    inputFieldComponents
      .filter(
        (it) =>
          !Object.keys(componentTypesWithCustomValidators).includes(it.name)
      )
      .forEach((type) => {
        Object.keys(defaultValidators).forEach((operator) => {
          test(`'${operator}' is correct for ${type.name}`, () => {
            const value = new ConditionValue("monkey");
            const expression = getExpression(
              type.name,
              "badger",
              operator,
              value
            );
            expect(expression).to.equal(
              defaultValidators[operator]("badger", value)
            );
          });
        });
      });

    Object.entries(componentTypesWithCustomValidators).forEach(
      ([type, config]) => {
        config.cases.forEach((testConfig) => {
          const value = testConfig.testValue || new ConditionValue("monkey");
          Object.keys(testConfig.operators).forEach((operator) => {
            const fieldName = "someField";
            test(`'${operator}' is correct for ${type} with value ${value.toPresentationString()}`, () => {
              const expression = getExpression(
                type,
                fieldName,
                operator,
                value
              );
              const expectedExpression = testConfig.operators[operator];
              expect(expression).to.equal(expectedExpression(fieldName, value));
            });
          });
        });
      }
    );
  });
});
