import { CheckboxesField } from "../CheckboxesField";
import { CheckboxesFieldComponent } from "@xgovformbuilder/model";

import { FormModel } from "../../models";

const def = {
  options: {
    classes: "govuk-input--width-10",
    required: true,
  },
  type: "CheckboxesField",
  name: "numberOfApplicants",
  title: "How many applicants are there?",
  list: "numberOfApplicants",
  schema: {},
};

const lists = [
  {
    name: "numberOfApplicants",
    title: "Number of people",
    type: "number",
    items: [
      {
        text: "1",
        value: 1,
        description: "",
        condition: "",
      },
      {
        text: "2",
        value: 2,
        description: "",
        condition: "",
      },
      {
        text: "3",
        value: 3,
        description: "",
        condition: "",
      },
      {
        text: "4",
        value: 4,
        description: "",
        condition: "",
      },
    ],
  },
];

test("ListFormComponent inits with the correct schema", () => {
  const componentDefinition: CheckboxesFieldComponent = {
    subType: "field",
    type: "CheckboxesField",
    name: "myCheckbox",
    title: "Tada",
    options: {},
    list: "numberOfApplicants",
    schema: {},
  };

  const formModel = new FormModel({ ...def, lists }, undefined);

  // @ts-ignore
  const component = new CheckboxesField(componentDefinition, formModel);
  expect("hello").toBe("hello");
  expect(component.formSchema.describe()).toBe("hello");
});
