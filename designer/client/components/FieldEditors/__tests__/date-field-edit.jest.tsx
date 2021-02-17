import React from "react";
import { render } from "@testing-library/react";
import { DateFieldEdit } from "../date-field-edit";
import { RenderWithContext } from "../../../__tests__/helpers/renderers";

describe("date field edit", () => {
  describe("date field edit fields", () => {
    let stateProps;
    let textFieldEditPage;

    beforeEach(() => {
      stateProps = {
        component: {
          type: "dateFieldEdit",
          name: "dateFieldEditClass",
          options: {},
        },
      };

      textFieldEditPage = render(
        <RenderWithContext stateProps={stateProps}>
          <DateFieldEdit />
        </RenderWithContext>
      );
    });

    test("should display details link title", () => {
      const text = "Additional settings";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display future title", () => {
      const text = "Max days in the future";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display future help text ", () => {
      const text = "Determines the latest date users can enter";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display past title", () => {
      const text = "Max days in the past";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display past help text ", () => {
      const text = "Determines the earliest date users can enter";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });
  });
});
