import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { Data } from "@xgovformbuilder/model";
import sinon from "sinon";
import ComponentEdit from "../client/component-edit";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { before, suite, test } = lab;

suite("Component edit", () => {
  const data = new Data({});
  const page = { path: "/1" };

  before(() => {
    data.clone = sinon.stub();
    data.save = sinon.stub();
  });

  test("Should display the ComponentTypeEdit component", () => {
    const component = { type: "TextField", name: "myComponent" };
    const wrapper = shallow(
      <ComponentEdit data={data} page={page} component={component} />
    );

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

  test("Should display the save and delete buttons", () => {
    const component = { type: "TextField", name: "myComponent" };
    const wrapper = shallow(
      <ComponentEdit data={data} page={page} component={component} />
    );

    const buttons = wrapper.find("button");
    expect(buttons.length).to.equal(2);
    expect(buttons.at(0).prop("type")).to.equal("submit");
    expect(buttons.at(0).text()).to.equal("Save");
    expect(buttons.at(1).prop("type")).to.equal("button");
    expect(buttons.at(1).prop("onClick")).to.equal(
      wrapper.instance().onClickDelete
    );
    expect(buttons.at(1).text()).to.equal("Delete");
  });

  test("Should store the populated component and call callback on submit", async () => {
    const onEdit = sinon.spy();

    const clonedData = {
      updateComponent: sinon.stub(),
    };
    const updatedData = sinon.stub();
    const savedData = sinon.stub();
    data.clone.returns(clonedData);
    clonedData.updateComponent.returns(updatedData);
    data.save.resolves(savedData);

    const component = { type: "TextField", name: "myComponent" };
    const updatedComponent = {
      type: "TextField",
      schema: { max: 24, min: 22 },
      options: { required: false },
    };
    const wrapper = shallow(
      <ComponentEdit
        data={data}
        page={page}
        component={component}
        onEdit={onEdit}
      />
    );

    wrapper.instance().storeComponent(updatedComponent);

    await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });

    expect(clonedData.updateComponent.callCount).to.equal(1);
    expect(clonedData.updateComponent.firstCall.args[0]).to.equal(page.path);
    expect(clonedData.updateComponent.firstCall.args[1]).to.equal(
      component.name
    );
    expect(clonedData.updateComponent.firstCall.args[2]).to.equal(
      updatedComponent
    );

    expect(data.save.callCount).to.equal(1);
    expect(data.save.firstCall.args[0]).to.equal(updatedData);

    expect(onEdit.callCount).to.equal(1);
    expect(onEdit.firstCall.args[0]).to.equal({ data: savedData });
  });
});
