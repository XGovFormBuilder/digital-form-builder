import React from "react";
import { render } from "@testing-library/react";
import SelectConditions from "./../SelectConditions";
import { DataContext } from "../../context";
import { Data } from "@xgovformbuilder/model";

const dataValue = {
  data: {
    lists: [],
    pages: [],
    sections: [],
    startPage: "",
    conditions: [],
  },
  save: jest.fn(),
};
export const customRender = (children, providerProps = dataValue) => {
  return render(
    <DataContext.Provider value={providerProps}>
      {children}
      <div id="portal-root" />
    </DataContext.Provider>
  );
};

describe("SelectConditions", () => {
  let props;

  beforeEach(() => {
    props = {
      path: "/some-path",
      conditionsChange: jest.fn() as any,
      hints: [],
      noFieldsHintText: "NoFieldsHintText",
    };
  });

  test("noFieldsAvailable hint text is rendered correctly", () => {
    const { getByText } = customRender(<SelectConditions {...props} />);

    const hint = "NoFieldsHintText";
    expect(getByText(hint)).toBeInTheDocument();
  });
});

test("SelectConditions renders available conditions", () => {
  let data = {
    lists: [],
    pages: [
      {
        path: "/uk-passport",
        components: [
          {
            type: "YesNoField",
            name: "ukPassport",
            title: "Do you have a UK passport?",
            options: {
              required: true,
            },
            schema: {},
          },
        ],
        next: [
          {
            path: "/how-many-people",
          },
          {
            path: "/no-uk-passport",
            condition: "b-NGgWvGISkJJLuzsJIjv",
          },
        ],
        title: "Do you have a UK passport?",
      },
      {
        path: "/no-uk-passport",
        title: "You're not eligible for this service",
        component: [
          {
            type: "Para",
            content:
              "If you still think you're eligible please contact the Foreign and Commonwealth Office.",
            options: {
              required: true,
            },
            schema: {},
          },
        ],
        next: [],
      },
      {
        path: "/how-many-people",
        components: [
          {
            options: {
              classes: "govuk-input--width-10",
              required: true,
            },
            type: "SelectField",
            name: "numberOfApplicants",
            title: "How many applicants are there?",
            list: "numberOfApplicants",
          },
        ],
        next: [
          {
            path: "/applicant-one",
          },
        ],
        title: "How many applicants are there?",
      },
    ],
    sections: [],
    startPage: "",
    conditions: [
      {
        name: "a-NGgWvGISkJJLuzsJIjv",
        displayName: "hasUKPassport",
        value: {
          name: "hasUKPassport",
          conditions: [
            {
              field: {
                name: "ukPassport",
                type: "YesNoField",
                display: "Do you have a UK passport?",
              },
              operator: "is",
              value: {
                type: "Value",
                value: "yes",
                display: "Yes, I have a UK passport",
              },
            },
          ],
        },
      },
      {
        name: "b-NGgWvGISkJJLuzsJIjv",
        displayName: "doesntHaveUKPassport",
        value: {
          name: "doesntHaveUKPassport",
          conditions: [
            {
              field: {
                name: "ukPassport",
                type: "YesNoField",
                display: "Do you have a UK passport?",
              },
              operator: "is",
              value: {
                type: "Value",
                value: "no",
                display: "No, I do not have a UK passport",
              },
            },
          ],
        },
      },
    ],
  };
  const providerProps = {
    data,
    save: jest.fn(),
  };
  const { getByText, queryByText, getByTestId } = customRender(
    <SelectConditions />,
    providerProps
  );
  const expectedConditions = data.conditions.map(
    (condition) => condition.displayName
  );

  expect(queryByText("You cannot add any conditions as")).toBeNull();
  expect(getByTestId("select-conditions")).toBeInTheDocument();
  expectedConditions.forEach((condition) => {
    expect(getByText(condition)).toBeInTheDocument();
  });
});
