import React from "react";
import { render } from "@testing-library/react";
import { TextFieldEdit } from "../text-field-edit";
import { RenderWithContext } from "../../../__tests__/helpers/renderers";

describe("Text field edit", () => {
  describe("Text field edit fields", () => {
    let stateProps;
    let textFieldEditPage;

    beforeEach(() => {
      stateProps = {
        component: {
          type: "textFieldEdit",
          name: "TextFieldEditClass",
          options: {},
        },
      };

      textFieldEditPage = render(
        <RenderWithContext stateProps={stateProps}>
          <TextFieldEdit />
        </RenderWithContext>
      );
    });

    test("should display details link title", () => {
      const text = "Additional settings";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display min length title", () => {
      const text = "Min length";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display min length help text ", () => {
      const text = "Specifies the minimum number of characters users can enter";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display max length title", () => {
      const text = "Max length";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display max length help text ", () => {
      const text = "Specifies the maximum number of characters users can enter";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display length title", () => {
      const text = "Length";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display length help text ", () => {
      const text =
        "Specifies the exact character length users must enter. Using this setting negates any values you set for Min length or Max length.";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display regex title", () => {
      const text = "Regex";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display regex help text ", () => {
      const text =
        "Specifies a regular expression to validate users' inputs. Use JavaScript syntax.";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display autocomplete title", () => {
      const text = "Autocomplete";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display autocomplete help text ", () => {
      const text =
        "Add the autocomplete attribute to this field. For example, 'on' or 'given-name'.";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });
  });
});
