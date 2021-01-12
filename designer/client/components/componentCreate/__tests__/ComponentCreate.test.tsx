import React from "react";
import { mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { Data } from "@xgovformbuilder/model";
import sinon from "sinon";

import { ComponentCreate } from "../ComponentCreate";
import { ComponentContextProvider } from "../../../reducers/component";
import { DataContext } from "../../../context";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { beforeEach, suite, test } = lab;

suite("ComponentCreate:", () => {
  const detailsComponentDef = {
    name: "Details",
    type: "Details",
    title: "Details",
    subType: "content",
  };

  const data = new Data({ pages: [{ path: "/1" }] });
  const dataSpy = sinon.spy(data);
  const page = { path: "/1" };

  beforeEach(() => {});

  const WrappingComponent = ({
    dataValue = { data: dataSpy, save: sinon.stub() },
    componentValue,
    children,
  }) => {
    return (
      <DataContext.Provider value={dataValue}>
        <ComponentContextProvider {...componentValue}>
          {children}
        </ComponentContextProvider>
      </DataContext.Provider>
    );
  };

  test("Selecting a component type should display the ComponentTypeEdit component", async () => {
    const wrapper = mount(<ComponentCreate page={page} />, {
      wrappingComponent: WrappingComponent,
    });

    expect(wrapper.find("ComponentTypeEdit").exists()).to.be.false();

    const componentCreateList = wrapper.find("ComponentCreateList");
    componentCreateList.prop("onSelectComponent")(detailsComponentDef);
    wrapper.update();

    expect(wrapper.find("ComponentTypeEdit").exists()).to.be.true();
  });

  test("Should store the populated component and call callback on submit", async () => {
    let saveStub = sinon.stub();
    const component = { ...detailsComponentDef, title: "1", content: "1" };

    const wrapper = mount(<ComponentCreate page={page} />, {
      wrappingComponent: WrappingComponent,
      wrappingComponentProps: {
        dataValue: { data: dataSpy, save: saveStub },
        componentValue: {
          component,
        },
      },
    });

    wrapper
      .find("form")
      .invoke("onSubmit")()
      .then(() => {
        expect(dataSpy.addComponent.callCount).to.equal(1);
        expect(dataSpy.addComponent.firstCall.args[0]).to.equal(page.path);
        expect(dataSpy.addComponent.firstCall.args[1]).to.equal(component);
      });
  });

  test("'Back to create component list' link", async () => {
    let saveStub = sinon.stub();
    const wrapper = mount(<ComponentCreate page={page} />, {
      wrappingComponent: WrappingComponent,
      wrappingComponentProps: {
        dataValue: { data: dataSpy, save: saveStub },
      },
    });

    const componentCreateList = wrapper.find("ComponentCreateList");

    expect(wrapper.find("ComponentTypeEdit").exists()).to.be.false();
    componentCreateList.prop("onSelectComponent")(detailsComponentDef);
    wrapper.update();
    expect(wrapper.find("ComponentTypeEdit").exists()).to.be.true();

    expect(wrapper.find("BackLink").exists()).to.be.true();
    expect(wrapper.find("ComponentCreateList").exists()).to.be.false();
    expect(wrapper.find("ComponentTypeEdit").exists()).to.be.true();

    wrapper.find("BackLink").invoke("onClick")({
      preventDefault: sinon.stub(),
    });
    wrapper.update();

    expect(wrapper.find("BackLink").exists()).to.be.false();
    expect(wrapper.find("ComponentCreateList").exists()).to.be.true();
    expect(wrapper.find("ComponentTypeEdit").exists()).to.be.false();
  });

  test("it displays ErrorSummary when validation fails", async () => {
    const saveStub = sinon.stub();

    const wrapper = mount(<ComponentCreate page={page} />, {
      wrappingComponent: WrappingComponent,
      wrappingComponentProps: {
        dataValue: { data: dataSpy, save: saveStub },
      },
    });

    const componentCreateList = wrapper.find("ComponentCreateList");
    componentCreateList.prop("onSelectComponent")(detailsComponentDef);
    wrapper.update();

    wrapper.find("form").invoke("onSubmit")();
    wrapper.update();

    expect(wrapper.find("ErrorSummary").exists()).to.be.true();
  });
});
