import React from "react";
import { initI18n } from "../../i18n";
import { render } from "@testing-library/react";
import { RenderWithContext } from "../../__tests__/helpers/renderers";
import SectionEdit from "../section-edit";

describe("Section edit", () => {
  initI18n();

  describe("Section edit fields", () => {
    let stateProps;
    let textFieldEditPage;

    beforeEach(() => {
      stateProps = {
        component: {
          type: "sectionFieldEdit",
          name: "sectionFieldEditClass",
          options: {},
        },
      };

      textFieldEditPage = render(
        <RenderWithContext stateProps={stateProps}>
          <SectionEdit />
        </RenderWithContext>
      );
    });

    test("should display section title", () => {
      const text = "Section title";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display future section title help text ", () => {
      const text =
        "Appears above the page title. If these titles are the same, only the page title will show.";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display section name", () => {
      const text = "Section name";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display future section name help text ", () => {
      const text =
        "Automatically populated. It does not show on the page. You usually do not need to change it unless an integration requires it. It must not contain spaces.";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });
  });
});
