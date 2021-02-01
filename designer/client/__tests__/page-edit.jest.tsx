import React from "react";
import sinon from "sinon";
import PageEdit from "../page-edit";
import { Data } from "@xgovformbuilder/model";
import { ToggleApi } from "../api/toggleApi";
import { render } from "@testing-library/react";
import { initI18n } from "../i18n";
import { DataContext } from "../context";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

const history = createMemoryHistory();
history.push("");

const customRender = (ui, { providerProps, ...renderOptions }) => {
  const rendered = render(
    <Router history={history}>
      <DataContext.Provider value={providerProps}>{ui}</DataContext.Provider>
    </Router>,
    renderOptions
  );
  return {
    ...rendered,
    rerender: (ui, options) =>
      customRender(ui, { container: rendered.container, ...options }),
  };
};

describe("Duplicate button", () => {
  beforeEach(() => {
    initI18n();
    sinon.restore();
  });

  test("should show duplicate if feature toggle is set to true", async () => {
    const data = new Data({
      pages: [{ path: "/1", section: "badger", title: "My first page" }],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
      ],
    } as any);

    const providerProps = {
      data,
      save: jest.fn(),
    };

    sinon.stub(ToggleApi.prototype, "fetchToggles").callsFake(function () {
      return { featureEditPageDuplicateButton: true };
    });

    let { findAllByText } = customRender(<PageEdit page={data.pages[0]} />, {
      providerProps,
    });

    expect(await findAllByText("Save")).toBeTruthy();
    expect(await findAllByText("Delete")).toBeTruthy();
    expect(await findAllByText("Duplicate")).toBeTruthy();
  });

  test("should not show duplicate if feature toggle is not set to true", async () => {
    const data = new Data({
      pages: [{ path: "/1", section: "badger", title: "My first page" }],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
      ],
    });

    const providerProps = {
      data,
      save: jest.fn(),
    };

    sinon.stub(ToggleApi.prototype, "fetchToggles").callsFake(function () {
      return { featureEditPageDuplicateButton: "true" };
    });

    let { findAllByText, queryAllByText } = customRender(
      <PageEdit page={data.pages[0]} />,
      { providerProps }
    );

    expect(await findAllByText("Save")).toBeTruthy();
    expect(await findAllByText("Delete")).toBeTruthy();
    expect(await queryAllByText("Duplicate")).toHaveLength(0);
  });
});
