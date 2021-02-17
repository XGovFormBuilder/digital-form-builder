import React from "react";
import { render } from "@testing-library/react";
import { NumberFieldEdit } from "../number-field-edit";
import { RenderWithContext } from "../../../__tests__/helpers/renderers";

describe("Number field edit", () => {
  describe("Number field edit fields", () => {
    let stateProps;
    let textFieldEditPage;

    beforeEach(() => {
      stateProps = {
        component: {
          type: "numberFieldEdit",
          name: "numberFieldEditClass",
          options: {},
        },
      };

      textFieldEditPage = render(
        <RenderWithContext stateProps={stateProps}>
          <NumberFieldEdit />
        </RenderWithContext>
      );
    });

    test("should display details link title", () => {
      const text = "Additional settings";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display min title", () => {
      const text = "Min";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display min help text ", () => {
      const text = "Specifies the lowest number users can enter";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display max title", () => {
      const text = "Max";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display max help text ", () => {
      const text = "Specifies the highest number users can enter";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display precision title", () => {
      const text = "Precision";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display precision help text ", () => {
      const text =
        "Specifies the number of decimal places users can enter. For example, to allow users to enter numbers with up to two decimal places, set this to 2";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });
  });
});
