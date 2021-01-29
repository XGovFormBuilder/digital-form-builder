import React from "react";
import sinon from "sinon";
import PageEdit from "../page-edit";
import { Data } from "@xgovformbuilder/model";
import { ToggleApi } from "../api/toggleApi";
import { render } from "@testing-library/react";
import { initI18n } from "../i18n";

describe("Duplicate button", () => {
  beforeEach(() => {
    initI18n();
    sinon.reset();
  });

  test("should show duplicate if feature toggle is set to true", async () => {
    const data = new Data({
      pages: [{ path: "/1", title: "My first page" }],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
      ],
    });

    sinon.stub(ToggleApi.prototype, "fetchToggles").callsFake(function () {
      return { ff_featureDuplicatePage: "true" };
    });

    let { findAllByText } = render(
      <PageEdit data={data} page={data.pages[0]} />
    );

    expect(await findAllByText("Save")).toBeTruthy();
    expect(await findAllByText("Delete")).toBeTruthy();
    expect(await findAllByText("Duplicate")).toBeTruthy();
  });

  test("should not show duplicate if feature toggle is not set to true", async () => {
    const data = new Data({
      pages: [{ path: "/1", title: "My first page" }],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
      ],
    });

    sinon.stub(ToggleApi.prototype, "fetchToggles").callsFake(function () {
      return { ff_featureDuplicatePage: "yes" };
    });

    let { findAllByText, queryAllByText } = render(
      <PageEdit data={data} page={data.pages[0]} />
    );

    expect(await findAllByText("Save")).toBeTruthy();
    expect(await findAllByText("Delete")).toBeTruthy();
    expect(await queryAllByText("Duplicate")).toHaveLength(0);
  });
});
