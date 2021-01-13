import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";

import Menu from "../client/menu";
import { Flyout } from "../client/components/Flyout";
import { Data } from "@xgovformbuilder/model";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, beforeEach } = lab;

suite("Page", () => {
  let props;

  beforeEach(() => {
    const id = "test-123";
    const updatePersona = sinon.spy();
    const updateDownloadedAt = sinon.spy();
    const data = new Data({
      pages: [
        {
          path: "/1",
          title: "My first page",
          section: "badger",
          controller: "./pages/start.js",
          components: [],
        },
      ],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
        {
          name: "personalDetails",
          title: "Personal Details",
        },
      ],
    });

    props = {
      id,
      data,
      updateDownloadedAt,
      updatePersona,
    };
  });

  // test helpers
  const flyoutGetter = (title, wrapper) => () => {
    return wrapper
      .find(Flyout)
      .filterWhere((node) => {
        return node.prop("title") === title;
      })
      .first();
  };

  const getMenuButton = (title, wrapper) => {
    return wrapper
      .find(".menu__row")
      .first()
      .find("button")
      .filterWhere((node) => {
        return node.text() === title;
      })
      .first();
  };

  test("renders expected menu buttons", () => {
    const wrapper = shallow(<Menu {...props} />);
    const buttonsRow = wrapper.find(".menu__row").first();
    const buttons = buttonsRow.find("button").map((node) => node.text());

    const expectedButtons = [
      "Form Details",
      "Add Page",
      "Add Link",
      "Edit Sections",
      "Edit Conditions",
      "Edit Lists",
      "Edit Outputs",
      "Edit Fees",
      "Edit summary behaviour",
      "Summary",
    ];

    expect(buttons).to.equal(expectedButtons);
  });

  test("renders expected sub-menu buttons", () => {
    const wrapper = shallow(<Menu {...props} />);
    const buttonsRow = wrapper.find(".menu__row").at(1);
    const buttons = buttonsRow.find("a").map((node) => node.text());

    const expectedButtons = [
      "Create new form",
      "Import saved form",
      "Download form",
    ];

    expect(buttons).to.equal(expectedButtons);
  });

  test('sub-menu "Create new form" redirects to new form page', () => {
    const wrapper = shallow(<Menu {...props} />);
    const createNewFormMenu = wrapper
      .find(".menu__row")
      .at(1)
      .find("a")
      .first();

    expect(createNewFormMenu.prop("href")).to.equal("/new");
    expect(createNewFormMenu.prop("onClick")).to.equal(undefined);
  });

  test.skip('menu "Form Details" shows correct Flyout', () => {
    const menuSettings = [
      {
        buttonText: "Form Details",
        stateProp: "showFormConfig",
        flyoutTitle: "Form Details",
      },
      {
        buttonText: "Add Page",
        stateProp: "showAddPage",
        flyoutTitle: "Add Page",
      },
      {
        buttonText: "Add Link",
        stateProp: "showAddLink",
        flyoutTitle: "Add Link",
      },
      {
        buttonText: "Edit Sections",
        stateProp: "showEditSections",
        flyoutTitle: "Edit Sections",
      },
      {
        buttonText: "Edit Conditions",
        stateProp: "showEditConditions",
        flyoutTitle: "Edit Conditions",
      },
      {
        buttonText: "Edit Lists",
        stateProp: "showEditLists",
        flyoutTitle: "Edit Lists",
      },
      {
        buttonText: "Edit Fees",
        stateProp: "showEditFees",
        flyoutTitle: "Edit Fees",
      },
      {
        buttonText: "Edit Outputs",
        stateProp: "showEditOutputs",
        flyoutTitle: "Edit Outputs",
      },
      {
        buttonText: "Edit summary behaviour",
        stateProp: "showEditSummaryBehaviour",
        flyoutTitle: "Edit Summary behaviour",
      },
      {
        buttonText: "Summary",
        stateProp: "showSummary",
        flyoutTitle: "Summary",
      },
    ];

    menuSettings.forEach((menuSetting) => {
      const { buttonText, flyoutTitle, stateProp } = menuSetting;
      const wrapper = shallow(<Menu {...props} />);

      const button = getMenuButton(buttonText, wrapper);
      const getFlyout = flyoutGetter(flyoutTitle, wrapper);
      const messagePrefix = flyoutTitle;

      expect(wrapper.state()[stateProp], messagePrefix).to.equal(undefined);
      expect(getFlyout().prop("show"), messagePrefix).to.equal(undefined);

      button.simulate("click");

      expect(wrapper.state()[stateProp], messagePrefix).to.equal(true);
      expect(getFlyout().prop("show"), messagePrefix).to.equal(true);
    });
  });
});
