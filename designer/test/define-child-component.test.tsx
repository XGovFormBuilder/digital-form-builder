import React from "react";
import { shallow } from "enzyme";
import * as Lab from "@hapi/lab";
import * as Code from "@hapi/code";
import sinon from "sinon";
import DefineChildComponent from "../client/components/define-child-component";
import ComponentTypeEdit from "../client/component-type-edit";
import { Data } from "@xgovformbuilder/model";

const lab = Lab.script();
exports.lab = lab;
const { before, suite, test } = lab;
const { expect } = Code;

suite("Define child component", () => {
  const data = new Data({});
  const page = { path: "/1" };
  const generatedId = "DMaslknf";
  const saveCallback = sinon.spy();
  const cancelCallback = sinon.spy();

  before(() => {
    data.getId = sinon.stub().resolves(generatedId);
    data.clone = sinon.stub();
    data.save = sinon.stub();
  });

  test("Should display form with component types in alphabetical order", () => {
    const wrapper = shallow(<DefineChildComponent data={data} page={page} />);

    const componentTypeInput = wrapper.find("select");
    let lastDisplayedTitle = "";
    componentTypeInput.find("options").forEach((type) => {
      expect(lastDisplayedTitle.localeCompare(type.title)).equal.to(-1);
      lastDisplayedTitle = type.title;
    });

    expect(wrapper.find("ComponentTypeEdit").exists()).to.equal(false);
  });

  test("Should pre-populate type field when provided with a component", () => {
    const component = { type: "TextField", name: "badger", hint: "My hint" };
    function EditComponentView() {}
    const wrapper = shallow(
      <DefineChildComponent
        data={data}
        page={page}
        component={component}
        EditComponentView={EditComponentView}
      />
    );

    const componentTypeInput = wrapper.find("select");
    expect(componentTypeInput.prop("defaultValue")).to.equal("TextField");

    expect(wrapper.find("ComponentTypeEdit").exists()).to.equal(false);
  });

  test("Selecting a component type should display the ComponentTypeEdit component", async () => {
    const wrapper = shallow(
      <DefineChildComponent
        data={data}
        page={page}
        saveCallback={saveCallback}
        cancelCallback={cancelCallback}
        EditComponentView={ComponentTypeEdit}
      />
    );
    await wrapper.instance().componentDidMount();

    wrapper
      .find("select")
      .simulate("change", { target: { value: "TextField" } });

    const componentTypeEdit = wrapper.find("ComponentTypeEdit");
    expect(componentTypeEdit.exists()).to.equal(true);
    expect(componentTypeEdit.prop("page")).to.equal(page);
    expect(componentTypeEdit.prop("component")).to.equal({
      type: "TextField",
      name: generatedId,
    });
    expect(componentTypeEdit.prop("data")).to.equal(data);
    expect(componentTypeEdit.prop("updateModel")).to.equal(
      wrapper.instance().storeComponent
    );
    expect(Object.keys(componentTypeEdit.props()).length).to.equal(4);
  });

  test("Should display the supplied EditComponentView component when initialised with a component", async () => {
    const component = { type: "TextField", name: "badger", hint: "My hint" };
    const wrapper = shallow(
      <DefineChildComponent
        data={data}
        page={page}
        saveCallback={saveCallback}
        cancelCallback={cancelCallback}
        component={component}
        EditComponentView={ComponentTypeEdit}
      />
    );
    await wrapper.instance().componentDidMount();

    const componentTypeEdit = wrapper.find("ComponentTypeEdit");
    expect(componentTypeEdit.exists()).to.equal(true);
    expect(componentTypeEdit.prop("page")).to.equal(page);
    expect(componentTypeEdit.prop("component")).to.equal(component);
    expect(componentTypeEdit.prop("data")).to.equal(data);
    expect(componentTypeEdit.prop("updateModel")).to.equal(
      wrapper.instance().storeComponent
    );
    expect(Object.keys(componentTypeEdit.props()).length).to.equal(4);
  });

  test("Clicking the save link calls the save callback", async () => {
    const component = { type: "TextField", name: "badger", hint: "My hint" };
    const wrapper = shallow(
      <DefineChildComponent
        data={data}
        page={page}
        saveCallback={saveCallback}
        cancelCallback={cancelCallback}
        component={component}
        EditComponentView={ComponentTypeEdit}
      />
    );
    await wrapper.instance().componentDidMount();

    wrapper.find("#save-child-component-link").simulate("click");

    expect(saveCallback.callCount).to.equal(1);
    expect(saveCallback.firstCall.args[0]).to.equal(component);
  });

  test("Clicking the cancel link calls the cancel callback", async () => {
    const component = { type: "TextField", name: "badger", hint: "My hint" };
    const wrapper = shallow(
      <DefineChildComponent
        data={data}
        page={page}
        saveCallback={saveCallback}
        cancelCallback={cancelCallback}
        component={component}
        EditComponentView={ComponentTypeEdit}
      />
    );
    await wrapper.instance().componentDidMount();

    wrapper.find("#cancel-child-component-link").simulate("click");

    expect(cancelCallback.callCount).to.equal(1);
  });
});
