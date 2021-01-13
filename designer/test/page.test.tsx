import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import PageTranslated, { Page } from "../client/page";
import { Flyout } from "../client/components/Flyout";
import PageEdit from "../client/page-edit";
import { ComponentCreate } from "../client/components/ComponentCreate";
import { Data } from "@xgovformbuilder/model";
import sinon from "sinon";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, beforeEach } = lab;

suite.skip("Page", () => {
  let data;
  let props;

  beforeEach(() => {
    data = new Data({
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
    } as any);

    props = {
      data,
      page: data.pages[0],
      i18n: sinon.spy((text) => text),
    };
  });

  test("PageEdit Flyout onHide toggles showEditor", () => {
    const wrapper = shallow(<Page {...props} />);
    const editor = wrapper.find(Flyout).first();

    wrapper.setState({ showEditor: true });
    expect(wrapper.state().showEditor).to.equal(true);

    editor.prop("onHide")();
    wrapper.update();
    expect(wrapper.state().showEditor).to.equal(false);
  });

  test("PageEdit onEdit toggles showEditor", () => {
    const wrapper = shallow(<Page {...props} />);
    const editor = wrapper.find(PageEdit).first();

    wrapper.setState({ showEditor: true });
    expect(wrapper.state().showEditor).to.equal(true);

    editor.prop("onEdit")();
    wrapper.update();
    expect(wrapper.state().showEditor).to.equal(false);
  });

  test("PageEdit Flyout receives showEditor correctly", () => {
    const wrapper = shallow(<Page {...props} />);

    wrapper.setState({ showEditor: "showEditor" });
    expect(wrapper.state().showEditor).to.equal("showEditor");
  });

  test("Page actions contain expected buttons", () => {
    const wrapper = shallow(<Page {...props} />);
    const actions = wrapper.find(".page__actions").children();

    expect(actions.at(0).text()).to.equal("Edit page");
    expect(actions.at(1).text()).to.equal("Create component");
    expect(actions.at(2).text()).to.equal("Preview");
  });

  test("Button Edit page toggles showEditor", () => {
    const wrapper = shallow(<Page {...props} />);
    const button = wrapper.find(".page__actions").children().first();

    expect(wrapper.state().showEditor).to.equal(false);

    button.simulate("click");
    expect(wrapper.state().showEditor).to.equal(true);
  });

  test("Button add components toggles showAddComponent", () => {
    const wrapper = shallow(<Page {...props} />);
    const button = wrapper.find(".page__actions").children().at(1);

    expect(wrapper.state().showAddComponent).to.equal(false);

    button.simulate("click");
    expect(wrapper.state().showAddComponent).to.equal(true);
  });

  test("AddComponent Flyout onHide toggles showAddComponent", () => {
    const wrapper = shallow(<Page {...props} />);
    const addComponent = wrapper.find(Flyout).at(1);

    wrapper.setState({ showAddComponent: true });
    expect(wrapper.state().showAddComponent).to.equal(true);

    addComponent.prop("onHide")();
    wrapper.update();
    expect(wrapper.state().showAddComponent).to.equal(false);
  });

  test("ComponentCreate onCreate toggles showAddComponent", () => {
    const wrapper = shallow(<Page {...props} />);
    const componentCreate = wrapper.find(ComponentCreate).first();

    wrapper.setState({ showAddComponent: true });
    expect(wrapper.state().showAddComponent).to.equal(true);

    componentCreate.prop("onCreate")();
    wrapper.update();
    expect(wrapper.state().showAddComponent).to.equal(false);
  });

  test("AddComponent Flyout receives showAddComponent correctly", () => {
    const wrapper = shallow(<Page {...props} />);

    wrapper.setState({ showAddComponent: "showAddComponent" });
    expect(wrapper.state().showAddComponent).to.equal("showAddComponent");
  });

  test("page is wrapped with withTranslation", () => {
    const wrapper = shallow(<PageTranslated />);

    expect(wrapper.prop("i18n")).to.exist();
  });

  test("Expected translation are called", () => {
    shallow(<Page {...props} />);

    expect(props.i18n.args.flat()).to.equal([
      "Edit page",
      "Edit page",
      "Create component",
      "Create component",
      "Preview page",
      "Preview",
    ]);
  });
});
