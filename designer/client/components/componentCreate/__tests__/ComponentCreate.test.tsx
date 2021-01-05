import React from "react";
import { shallow, mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { Data } from "@xgovformbuilder/model";
import sinon from "sinon";

import { ComponentCreate } from "../ComponentCreate";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { beforeEach, suite, test } = lab;

suite("Component create", () => {
  const detailsComponentDef = {
    name: "Details",
    type: "Details",
    title: "Details",
    subType: "content",
  };

  const data = new Data({});
  const page = { path: "/1" };
  const generatedId = "DMaslknf";
  let onCreate;

  beforeEach(() => {
    data.getId = sinon.stub().resolves(generatedId);
    data.clone = sinon.stub();
    data.save = sinon.stub();
    onCreate = sinon.stub();
  });

  test("Selecting a component type should display the ComponentTypeEdit component", async () => {
    const wrapper = shallow(
      <ComponentCreate data={data} page={page} onCreate={onCreate} />
    );

    await wrapper.instance().componentDidMount();

    const form = wrapper.find("form");
    const componentCreateList = form.find("ComponentCreateList");

    expect(wrapper.find("ComponentTypeEdit").exists()).to.be.false();

    componentCreateList.prop("onSelectComponent")(detailsComponentDef);

    expect(wrapper.find("ComponentTypeEdit").exists()).to.be.true();
  });

  test("Should store the populated component and call callback on submit", async () => {
    const clonedData = {
      addComponent: sinon.stub(),
    };

    const updatedData = sinon.stub();
    const savedData = sinon.stub();
    data.clone.returns(clonedData);
    clonedData.addComponent.returns(updatedData);
    data.save.resolves(savedData);

    const wrapper = shallow(
      <ComponentCreate data={data} page={page} onCreate={onCreate} />
    );

    wrapper.instance().storeComponent(detailsComponentDef);

    await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });

    expect(clonedData.addComponent.callCount).to.equal(1);
    expect(clonedData.addComponent.firstCall.args[0]).to.equal(page.path);
    expect(clonedData.addComponent.firstCall.args[1]).to.equal(
      detailsComponentDef
    );

    expect(data.save.callCount).to.equal(1);
    expect(data.save.firstCall.args[0]).to.equal(updatedData);

    expect(onCreate.callCount).to.equal(1);
    expect(onCreate.firstCall.args[0]).to.equal({ data: savedData });
  });

  test("Should not allow onSubmit multiple times", async () => {
    const component = {
      type: "TextField",
      schema: { max: 24, min: 22 },
      options: { required: false },
    };
    const clonedData = { addComponent: sinon.stub() };
    const savedData = sinon.stub();
    const updatedData = sinon.stub();
    data.clone.returns(clonedData);
    clonedData.addComponent.returns(updatedData);
    data.save.resolves(savedData);

    const wrapper = shallow(
      <ComponentCreate data={data} page={page} onCreate={onCreate} />
    );

    wrapper.instance().storeComponent(component);

    await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });
    await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });
    await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });

    const saveButton = wrapper.find(".govuk-button").first();
    expect(data.save.callCount).to.equal(1);
    expect(saveButton.prop("disabled")).to.equal(true);
  });

  test("'Back to create component list' link", async () => {
    const wrapper = shallow(
      <ComponentCreate data={data} page={page} onCreate={onCreate} />
    );

    await wrapper.instance().componentDidMount();

    const form = wrapper.find("form");
    const componentCreateList = form.find("ComponentCreateList");

    expect(wrapper.find("BackLink").exists()).to.be.false();

    componentCreateList.prop("onSelectComponent")(detailsComponentDef);

    expect(wrapper.find("BackLink").exists()).to.be.true();
    expect(wrapper.find("ComponentCreateList").exists()).to.be.false();
    expect(wrapper.find("ComponentTypeEdit").exists()).to.be.true();

    wrapper.find("BackLink").prop("onClick")({ preventDefault: sinon.stub() });

    expect(wrapper.find("BackLink").exists()).to.be.false();
    expect(wrapper.find("ComponentCreateList").exists()).to.be.true();
    expect(wrapper.find("ComponentTypeEdit").exists()).to.be.false();
  });

  test("it displays ErrorSummary when validation fails", async () => {
    const wrapper = mount(
      <ComponentCreate data={data} page={page} onCreate={onCreate} />
    );

    await wrapper.instance().componentDidMount();

    let form = wrapper.find("form");
    const componentCreateList = form.find("ComponentCreateList");
    componentCreateList.prop("onSelectComponent")(detailsComponentDef);
    wrapper.update();

    form.prop("onSubmit")({ preventDefault: sinon.stub() });
    wrapper.update();

    expect(wrapper.find("ErrorSummary").exists()).to.be.true();
  });
});
