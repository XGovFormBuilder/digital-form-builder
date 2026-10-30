import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { CustomValidationMessage } from "../CustomValidationMessage";
import { RenderWithContext } from "../../../__tests__/helpers/renderers";

describe("CssClasses", () => {
  describe("CssClassField", () => {
    let stateProps;
    let page;

    beforeEach(() => {
      stateProps = {
        component: {
          type: "TelephoneNumberField",
          name: "testTelephone",
          options: {},
        },
      };

      page = render(
        <RenderWithContext stateProps={stateProps}>
          <CustomValidationMessage />
        </RenderWithContext>
      );
    });

    test("should display display correct title and hint", () => {
      const title = "Validation message";
      const hint =
        "Enter the validation message to show when a validation error occurs";
      expect(page.getByText(title)).toBeInTheDocument();
      expect(page.getByText(hint)).toBeInTheDocument();
    });

    test("value should change and be displayed correctly", () => {
      const { getByLabelText } = page;
      const input = getByLabelText("Validation message");
      expect(input.value).toBe("");
      fireEvent.change(input, {
        target: { value: "It's wrong!" },
      });
      expect(input.value).toBe("It's wrong!");
    });
  });
});
