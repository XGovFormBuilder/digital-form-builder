import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { RenderWithContextAndDataContext } from "../../__tests__/helpers/renderers";
import { Data } from "@xgovformbuilder/model";

import OutputEdit from "../output-edit";

describe("OutputEdit", () => {
  let mockData: Data;
  let mockSave: any;

  beforeEach(() => {
    mockSave = jest.fn().mockResolvedValue(mockData);
    mockData = {
      pages: [
        {
          title: "First page",
          path: "/first-page",
          components: [
            {
              name: "9WH4EX",
              options: {},
              type: "TextField",
              title: "Email",
            },
          ],
          controller: "./pages/summary.js",
        },
      ],
      outputs: [],
      conditions: [],
      lists: [],
    };
  });

  describe("Notify", () => {
    test("Notify Output object is created correctly", async () => {
      const props: any = {
        onEdit: jest.fn(),
        onCancel: jest.fn(),
        data: mockData,
        output: {
          name: "Notify Test",
          title: "Notify Test",
          type: "notify",
          outputConfiguration: {
            templateId: "123ID",
            apiKey: "123KEY", // pragma: allowlist secret
            emailField: "9WH4EX",
            personalisation: [],
          },
        },
      };

      const { getByText, getByLabelText } = render(
        <RenderWithContextAndDataContext
          mockData={mockData}
          mockSave={mockSave}
        >
          <OutputEdit {...props} />
        </RenderWithContextAndDataContext>
      );

      // change title
      fireEvent.change(getByLabelText("Title"), {
        target: { value: "NewTitle" },
      });

      // change name
      fireEvent.change(getByLabelText("Name"), {
        target: { value: "NewName" },
      });

      // change templateId
      fireEvent.change(getByLabelText("Template ID"), {
        target: { value: "NewTemplateId" },
      });

      // change apiKey
      fireEvent.change(getByLabelText("API Key"), {
        target: { value: "NewAPIKey" },
      });

      // change email field
      fireEvent.change(getByLabelText("Email field"), {
        target: { value: "9WH4EX" },
      });

      // include references
      fireEvent.click(getByText("Include webhook and payment references"));

      // save
      fireEvent.click(getByText("Save"));

      await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));

      expect(mockSave.mock.calls[0][0].outputs).toEqual([
        {
          name: "NewName",
          title: "NewTitle",
          type: "notify",
          outputConfiguration: {
            personalisation: [],
            templateId: "NewTemplateId",
            apiKey: "NewAPIKey", // pragma: allowlist secret
            emailField: "9WH4EX",
            addReferencesToPersonalisation: true,
          },
        },
      ]);
    });
  });
});
