import React from "react";
import {
  SortableContainer,
  SortableElement,
  arrayMove,
} from "react-sortable-hoc";
import Flyout from "./flyout";
import PageEdit from "./page-edit";
import { Component } from "./component";
import { ComponentCreate } from "./components/componentCreate";
import { ComponentTypes, clone } from "@xgovformbuilder/model";
import { withI18n } from "./i18n";

import { PageLinkage } from "./components/page-linkage";

const SortableItem = SortableElement(({ index, page, component, data }) => (
  <div className="component-item">
    <Component key={index} page={page} component={component} data={data} />
  </div>
));

const SortableList = SortableContainer(({ page, data }) => {
  return (
    <div className="component-list">
      {page.components.map((component, index) => (
        <SortableItem
          key={index}
          index={index}
          page={page}
          component={component}
          data={data}
        />
      ))}
    </div>
  );
});

export class Page extends React.Component {
  state = {
    showEditor: false,
    showAddComponent: false,
  };

  showEditor = (e, value) => {
    e.stopPropagation();
    this.setState({ showEditor: value });
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    const { page, data } = this.props;
    const copy = clone(data);
    const copyPage = data.findPage(page.path);
    copyPage.components = arrayMove(copyPage.components, oldIndex, newIndex);

    data.save(copy);

    // OPTIMISTIC SAVE TO STOP JUMP

    // const { page, data } = this.props
    // page.components = arrayMove(page.components, oldIndex, newIndex)

    // data.save(data)
  };

  toggleAddComponent = () => {
    this.setState({
      showAddComponent: !this.state.showAddComponent,
    });
  };

  toggleEditor = () => {
    this.setState({
      showEditor: !this.state.showEditor,
    });
  };

  render() {
    const { page, data, id, previewUrl, persona, i18n } = this.props;
    const { sections } = data;
    const formComponents = page?.components?.filter(
      (comp) =>
        ComponentTypes.find((type) => type.name === comp.type).subType ===
        "field"
    );
    const section =
      page.section && sections.find((section) => section.name === page.section);
    const conditional = !!page.condition;
    let pageTitle =
      page.title ||
      (formComponents.length === 1 && page.components[0] === formComponents[0]
        ? formComponents[0].title
        : page.title);

    if (pageTitle && typeof pageTitle === "object") {
      pageTitle = pageTitle.en;
    }

    const highlight = persona?.paths?.includes(page.path);
    const pageClassName = [
      `page${conditional ? " conditional" : ""}`,
      `${highlight ? "highlight" : ""}`,
    ].join(" ");

    return (
      <div
        id={page.path}
        className={pageClassName}
        title={page.path}
        style={this.props.layout}
      >
        <div className="page__heading">
          <h3>
            {section && <span>{section.title}</span>}
            {pageTitle}
          </h3>
          <PageLinkage page={page} data={data} layout={this.props.layout} />
        </div>

        <SortableList
          page={page}
          data={data}
          pressDelay={200}
          onSortEnd={this.onSortEnd}
          lockAxis="y"
          helperClass="dragging"
          lockToContainerEdges
          useDragHandle
        />

        <div className="page__actions">
          <button title={i18n("Edit page")} onClick={this.toggleEditor}>
            {i18n("Edit page")}
          </button>
          <button
            title={i18n("Create component")}
            onClick={this.toggleAddComponent}
          >
            {i18n("Create component")}
          </button>
          <a
            title={i18n("Preview page")}
            href={`${previewUrl}/${id}${page.path}`}
            target="_blank"
            rel="noreferrer"
          >
            {i18n("Preview")}{" "}
            <span className="govuk-visually-hidden">{pageTitle}</span>
          </a>
        </div>
        {this.state.showEditor && (
          <Flyout
            title="Edit Page"
            show={this.state.showEditor}
            onHide={this.toggleEditor}
          >
            <PageEdit page={page} data={data} onEdit={this.toggleEditor} />
          </Flyout>
        )}

        {this.state.showAddComponent && (
          <Flyout
            show={this.state.showAddComponent}
            onHide={this.toggleAddComponent}
          >
            <ComponentCreate
              page={page}
              data={data}
              onCreate={this.toggleAddComponent}
            />
          </Flyout>
        )}
      </div>
    );
  }
}

export default withI18n(Page);
