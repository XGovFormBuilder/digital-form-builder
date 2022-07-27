import React from "react";
import { render } from "@testing-library/react";
import { CssClasses } from "../CssClasses";
import { RenderWithContext } from "../../../__tests__/helpers/renderers";

describe("CssClasses", () => {
  describe("CssClassField", () => {
    let stateProps;
    let page;

    beforeEach(() => {
      stateProps = {
        component: {
          type: "CssClassField",
          name: "TestCssClass",
          options: {},
        },
      };

      page = render(
        <RenderWithContext stateProps={stateProps}>
          <CssClasses />
        </RenderWithContext>
      );
    });

    test("should display display correct title", () => {
      const text = "Classes";
      expect(page.getByText(text)).toBeInTheDocument();
    });

    test("should display display correct helptext", () => {
      const text =
        "Apply CSS classes to this field. For example, govuk-input govuk-!-width-full";
      expect(page.getByText(text)).toBeInTheDocument();
    });
  });
});
