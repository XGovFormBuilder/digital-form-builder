import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { Data } from "@xgovformbuilder/model";
import sinon from "sinon";

import { PageLinkage } from "../";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, after, before, beforeEach } = lab;

suite("Page Linkage", () => {
  let page;
  let data;
  let layout;
  let props;
  let event;

  before(() => {
    window.pageYOffset = 10;
  });

  beforeEach(() => {
    page = {
      path: "/home",
      title: "Home",
    };

    data = new Data({
      pages: [{ path: "/1" }, { path: "/2" }],
      sections: [],
      clone: sinon.stub().returnsThis(),
      addLink: sinon.stub().returns("updated mock data"),
      save: sinon.stub(),
    });

    layout = {
      node: {
        label: "/summary",
        width: 240,
        height: 141,
        x: 170,
        y: 411.5,
      },
      top: "341px",
      left: "50px",
    };

    event = {
      clientX: 100,
      clientY: 100,
      preventDefault: sinon.stub(),
      dataTransfer: {
        setData: sinon.stub(),
        getData: sinon.stub().returns(JSON.stringify(page)),
      },
    };

    props = { page, data, layout };
  });

  after(() => {
    window.pageYOffset = 0;
  });

  test("Drag area is rendered", () => {
    const wrapper = shallow(<PageLinkage {...props} />);
    const dragArea = wrapper.find(".page-linkage__drag-area").first();
    expect(dragArea.exists()).to.be.true();
  });

  test("Highlight area is not rendered", () => {
    const wrapper = shallow(<PageLinkage {...props} />);
    const highlightArea = wrapper.find(".page-linkage__highlight-area").first();
    expect(highlightArea.exists()).to.be.false();
  });

  test("Highlight area is rendered on drag start", () => {
    const wrapper = shallow(<PageLinkage {...props} />);
    const dragArea = wrapper.find(".page-linkage__drag-area").first();
    let highlightArea = wrapper.find(".page-linkage__highlight-area").first();

    expect(highlightArea.exists()).to.be.false();

    dragArea.prop("onDragStart")(event);
    highlightArea = wrapper.find(".page-linkage__highlight-area").first();
    expect(highlightArea.exists()).to.be.true();
  });

  test("Highlight area is rendered on drag over", () => {
    const wrapper = shallow(<PageLinkage {...props} />);
    const dragArea = wrapper.find(".page-linkage__drag-area").first();
    let highlightArea = wrapper.find(".page-linkage__highlight-area").first();

    expect(highlightArea.exists()).to.be.false();

    dragArea.prop("onDragOver")(event);
    highlightArea = wrapper.find(".page-linkage__highlight-area").first();
    expect(highlightArea.exists()).to.be.true();
    expect(event.preventDefault.called).to.be.true();
  });

  test("Highlight area is removed on drop", async () => {
    const wrapper = shallow(<PageLinkage {...props} />);
    const dragArea = wrapper.find(".page-linkage__drag-area").first();
    let highlightArea = wrapper.find(".page-linkage__highlight-area").first();

    expect(highlightArea.exists()).to.be.false();

    dragArea.prop("onDragOver")(event);
    highlightArea = wrapper.find(".page-linkage__highlight-area").first();
    expect(highlightArea.exists()).to.be.true();
    expect(event.preventDefault.called).to.be.true();

    await dragArea.prop("onDrop")(event);
    highlightArea = wrapper.find(".page-linkage__highlight-area").first();
    expect(highlightArea.exists()).to.be.false();
  });

  test("Highlight area is removed on drag end", () => {
    const wrapper = shallow(<PageLinkage {...props} />);
    const dragArea = wrapper.find(".page-linkage__drag-area").first();
    let highlightArea = wrapper.find(".page-linkage__highlight-area").first();

    expect(highlightArea.exists()).to.be.false();

    dragArea.prop("onDragOver")(event);
    highlightArea = wrapper.find(".page-linkage__highlight-area").first();
    expect(highlightArea.exists()).to.be.true();
    expect(event.preventDefault.called).to.be.true();

    dragArea.prop("onDragEnd")(event);
    highlightArea = wrapper.find(".page-linkage__highlight-area").first();
    expect(highlightArea.exists()).to.be.false();
  });

  test("Arrow svg renders correctly on drag", () => {
    const wrapper = shallow(<PageLinkage {...props} />);
    const dragArea = wrapper.find(".page-linkage__drag-area").first();
    dragArea.prop("onDragStart")(event);

    const svg = wrapper.find("RenderInPortal").first().children();
    const line = svg.find("line").first();

    expect(line.props()).to.include({
      x1: event.clientX,
      y1: event.clientY + window.pageYOffset,
      x2: event.clientX,
      y2: event.clientY + window.pageYOffset,
    });
  });

  test("Arrow svg updates correctly on drag move", () => {
    const wrapper = shallow(<PageLinkage {...props} />);
    const dragArea = wrapper.find(".page-linkage__drag-area").first();
    dragArea.prop("onDragStart")(event);

    let svg = wrapper.find("RenderInPortal").first().children();
    let line = svg.find("line").first();

    expect(line.props()).to.include({
      x1: event.clientX,
      y1: event.clientY + window.pageYOffset,
      x2: event.clientX,
      y2: event.clientY + window.pageYOffset,
    });

    dragArea.prop("onDrag")({ clientX: 200, clientY: 200 });
    svg = wrapper.find("RenderInPortal").first().children();
    line = svg.find("line").first();

    expect(line.props()).to.include({
      x1: event.clientX,
      y1: event.clientY + window.pageYOffset,
      x2: 200,
      y2: 200 + window.pageYOffset,
    });
  });

  test("Arrow svg is removed on drop", async () => {
    const wrapper = shallow(<PageLinkage {...props} />);
    const dragArea = wrapper.find(".page-linkage__drag-area").first();
    dragArea.prop("onDragStart")(event);

    let svg = wrapper.find("RenderInPortal").first().children();
    expect(svg.exists()).to.be.true();

    await dragArea.prop("onDrop")(event);
    svg = wrapper.find("RenderInPortal").first().children();
    expect(svg.exists()).to.be.false();
  });

  test("Arrow svg is removed on drag end", () => {
    const wrapper = shallow(<PageLinkage {...props} />);
    const dragArea = wrapper.find(".page-linkage__drag-area").first();
    dragArea.prop("onDragStart")(event);

    let svg = wrapper.find("RenderInPortal").first().children();
    expect(svg.exists()).to.be.true();

    dragArea.prop("onDragEnd")(event);
    svg = wrapper.find("RenderInPortal").first().children();
    expect(svg.exists()).to.be.false();
  });

  test("DragStart event correctly sets page data for transfer", () => {
    const wrapper = shallow(<PageLinkage {...props} />);
    const dragArea = wrapper.find(".page-linkage__drag-area").first();
    dragArea.prop("onDragStart")(event);
    expect(event.dataTransfer.setData.getCall(0).args).to.equal([
      "linkingPage",
      JSON.stringify(page),
    ]);
  });

  test.skip("Pages are correctly linked on drop", async () => {
    const linkedPage = {
      path: "/summary",
      title: "Summary",
    };

    const draggedPage = JSON.parse(event.dataTransfer.getData());

    const wrapper = shallow(<PageLinkage {...props} page={linkedPage} />);
    const dragArea = wrapper.find(".page-linkage__drag-area").first();

    await dragArea.prop("onDrop")(event);
    expect(data.clone.called).to.be.true();
    expect(data.addLink.getCall(0).args).to.equal([
      draggedPage.path,
      linkedPage.path,
    ]);
    expect(data.save.getCall(0).args).to.equal(["updated mock data"]);
  });

  test("Pages is not linked to itself", async () => {
    const draggedPage = JSON.parse(event.dataTransfer.getData());
    const wrapper = shallow(<PageLinkage {...props} page={draggedPage} />);
    const dragArea = wrapper.find(".page-linkage__drag-area").first();

    await dragArea.prop("onDrop")(event);
    expect(data.clone.called).to.be.false();
    expect(data.addLink.called).to.be.false();
    expect(data.addLink.called).to.be.false();
  });
});
