import React, { useContext, useState } from "react";
import {
  SortableContainer,
  SortableElement,
  arrayMove,
} from "react-sortable-hoc";

import { Flyout } from "../Flyout";
import PageEdit from "../../page-edit";
import { Component } from "../../component";
import { ComponentCreate } from "./../ComponentCreate";
import { ComponentTypes } from "@xgovformbuilder/model";
import { DataContext } from "../../context";
import { PageLinkage } from "../PageLinkage";
import { ComponentContextProvider } from "../../reducers/component";
import { findPage } from "../../data";
import { i18n } from "../../i18n";

const SortableItem = SortableElement(({ index, page, component, data }) => (
  <div className="component-item">
    <Component key={index} page={page} component={component} data={data} />
  </div>
));

const SortableList = SortableContainer(({ page = {}, data }) => {
  const { components = [] } = page;
  return (
    <div className="component-list">
      {components.map((component, index) => (
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

export const Page = ({ page, previewUrl, id, layout }) => {
  const { data, save } = useContext(DataContext);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [isCreatingComponent, setIsCreatingComponent] = useState(false);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const copy = { ...data };
    const [copyPage, index] = findPage(data, page.path);
    copyPage.components = arrayMove(copyPage.components!, oldIndex, newIndex);
    copy.pages[index] = copyPage;
    save(copy);
  };

  const onEditEnd = () => {
    setIsEditingPage(false);
  };

  const section = data.sections?.find(
    (section) => section.name === page.section
  );

  const formComponents =
    page?.components?.filter(
      (comp) =>
        ComponentTypes.find((type) => type.name === comp.type)?.subType ===
        "field"
    ) ?? [];

  let pageTitle =
    page.title ||
    (formComponents.length === 1 && page.components[0] === formComponents[0]
      ? formComponents[0].title
      : page.title);

  return (
    <div
      id={page.path}
      data-testid={page.path}
      title={page.path}
      className={"page"}
      style={layout}
    >
      <div className="page__heading">
        <h3>
          {section && <span>{section.title}</span>}
          {page.title}
        </h3>
        <PageLinkage page={page} layout={layout} />
      </div>

      <SortableList
        page={page}
        data={data}
        pressDelay={90}
        onSortEnd={onSortEnd}
        lockAxis="y"
        helperClass="dragging"
        lockToContainerEdges
      />

      <div className="page__actions">
        <button
          title={i18n("Edit page")}
          onClick={(_e) => setIsEditingPage(true)}
        >
          {i18n("Edit page")}
        </button>
        <button
          title={i18n("Create component")}
          onClick={(_e) => setIsCreatingComponent(true)}
        >
          {i18n("Create component")}
        </button>
        <a
          title={i18n("Preview page")}
          href={new URL(`${id}${page.path}`, previewUrl).toString()}
          target="_blank"
          rel="noreferrer"
        >
          {i18n("Preview")}{" "}
          <span className="govuk-visually-hidden">{pageTitle}</span>
        </a>
      </div>
      {isEditingPage && (
        <Flyout title="Edit Page" onHide={setIsEditingPage}>
          <PageEdit page={page} onEdit={onEditEnd} />
        </Flyout>
      )}

      {isCreatingComponent && (
        <Flyout show={true} onHide={setIsCreatingComponent}>
          <ComponentContextProvider>
            <ComponentCreate
              renderInForm={true}
              toggleAddComponent={() => {
                setIsCreatingComponent(false);
              }}
              page={page}
            />
          </ComponentContextProvider>
        </Flyout>
      )}
    </div>
  );
};
