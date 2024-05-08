import React from "react";
import { render } from "@testing-library/react";
import { WebsiteFieldEdit } from "../website-field-edit";
import { RenderWithContext } from "../../../__tests__/helpers/renderers";

describe("Website field edit", () => {
  describe("Website field edit fields", () => {
    let stateProps;
    let textFieldEditPage;

    beforeEach(() => {
      stateProps = {
        component: {
          type: "websiteFieldEdit",
          name: "websiteFieldEditClass",
          options: {},
        },
      };

      textFieldEditPage = render(
        <RenderWithContext stateProps={stateProps}>
          <WebsiteFieldEdit />
        </RenderWithContext>
      );
    });

    test("should display prefix help text ", () => {
      const text = "Specifies the prefix of the field.";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });
  });
});
