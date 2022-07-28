import React, { Component, useContext, useState } from "react";
import { Input } from "@govuk-jsx/input";

import SelectConditions from "./conditions/SelectConditions";
import { toUrl } from "./helpers";
import { RenderInPortal } from "./components/RenderInPortal";
import { Flyout } from "./components/Flyout";
import SectionEdit from "./section/section-edit";
import { i18n, withI18n } from "./i18n";
import ErrorSummary from "./error-summary";
import { validateTitle, hasValidationErrors } from "./validations";
import { DataContext } from "./context";
import { addLink, findPage } from "./data";
import { addPage } from "./data/page/addPage";
import randomId from "./randomId";
import logger from "./plugins/logger";
import { AnyLengthString } from "aws-sdk/clients/comprehend";

const PageCreate = (props) => {
  const { page, i18n } = props;

  const { data, save } = useContext(DataContext);
  const [path, setPath] = useState("/");
  const [title, setTitle] = useState(page?.title);
  const [section, setSection] = useState(page?.section ?? "");
  const [controller, setController] = useState(page?.controller ?? "");
  const [linkFrom, setLinkFrom] = useState("");
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState("");
  const [pageType, setPageType] = useState("");
  const [errors, setErrors] = useState({});

  const { sections, pages } = data;

  const onSubmit = async (e) => {
    e.preventDefault();

    setTitle(title?.trim());
    setLinkFrom(linkFrom?.trim());
    setSection(section?.name?.trim());
    setPageType(pageType?.trim());
    setSelectedCondition(selectedCondition?.trim());

    let validationErrors = validate(title, path);
    if (hasValidationErrors(validationErrors)) return;

    const value = {
      path,
      title,
      components: [],
      next: [],
    };
    if (section) {
      value.section = section;
    }
    if (pageType) {
      value.controller = pageType;
    }

    let copy = addPage({ ...data }, value);

    if (linkFrom) {
      copy = addLink(copy, linkFrom, path, selectedCondition);
    }

    try {
      await save(copy);
      props.onCreate({ value });
    } catch (err) {
      logger.error("PageCreate", err);
    }
  };

  const validate = (title, path) => {
    const titleErrors = validateTitle("page-title", title, i18n);
    const errors = { ...titleErrors };
    const alreadyExists = data.pages.find((page) => page.path === path);
    if (alreadyExists) {
      errors.path = {
        href: "#page-path",
        children: `Path '${path}' already exists`,
      };
    }

    setErrors(errors); // change to ... if this doesn't work

    return errors;
  };

  const generatePath = (title, data) => {
    let path = toUrl(title);
    if (
      title.length > 0 &&
      data.pages.find((page) => page.path.startsWith(path))
    ) {
      path = `${path}-${randomId()}`;
    }

    return path;
  };

  const findSectionWithName = (name) => {
    const { sections } = data;
    return sections.find((section) => section.name === name);
  };

  const onChangeSection = (e) => {
    setSection(findSectionWithName(e.target.value));
  };

  const onChangeLinkFrom = (e) => {
    const input = e.target;
    setLinkFrom(input.value);
  };

  const onChangePageType = (e) => {
    const input = e.target;
    setPageType(input.value);
  };

  const onChangeTitle = (e) => {
    const input = e.target;
    const title = input.value;

    setTitle(title);
    setPath(generatePath(title, data));
  };

  const onChangePath = (e) => {
    const input = e.target;
    const path = input.value.startsWith("/") ? input.value : `/${input.value}`;
    const sanitisedPath = path.replace(/\s/g, "-");
    setPath(sanitisedPath);
  };

  const conditionSelected = (selectedCondition) => {
    setSelectedCondition(selectedCondition);
  };

  const editSection = (e, section) => {
    e.preventDefault();
    setSection(section);
    setIsEditingSection(true);
  };

  const closeFlyout = (sectionName) => {
    const propSection = section ?? {};
    setIsEditingSection(false);
    setSection(sectionName ? findSectionWithName(sectionName) : propSection);
  };

  return (
    <div>
      {hasValidationErrors(errors) && (
        <ErrorSummary errorList={Object.values(errors)} />
      )}
      <form onSubmit={(e) => onSubmit(e)} autoComplete="off">
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="page-type">
            {i18n("addPage.pageTypeOption.title")}
          </label>
          <span className="govuk-hint">
            {i18n("addPage.pageTypeOption.helpText")}
          </span>
          <select
            className="govuk-select"
            id="page-type"
            name="page-type"
            value={pageType}
            onChange={onChangePageType}
          >
            <option value="">Question Page</option>
            <option value="./pages/start.js">Start Page</option>
            <option value="./pages/summary.js">Summary Page</option>
          </select>
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="link-from">
            {i18n("addPage.linkFromOption.title")}
          </label>
          <span className="govuk-hint">
            {i18n("addPage.linkFromOption.helpText")}
          </span>
          <select
            className="govuk-select"
            id="link-from"
            name="from"
            value={linkFrom}
            onChange={onChangeLinkFrom}
          >
            <option />
            {pages?.map((page) => (
              <option key={page.path} value={page.path}>
                {page.path}
              </option>
            ))}
          </select>
        </div>

        {linkFrom && linkFrom.trim() !== "" && (
          <SelectConditions
            data={data}
            path={linkFrom}
            conditionsChange={conditionSelected}
            noFieldsHintText={i18n("conditions.noFieldsAvailable")}
          />
        )}

        <Input
          id="page-title"
          name="title"
          label={{
            className: "govuk-label--s",
            children: [i18n("addPage.pageTitleField.title")],
          }}
          value={title || ""}
          onChange={onChangeTitle}
          errorMessage={
            errors?.title ? { children: errors?.title.children } : undefined
          }
        />

        <Input
          id="page-path"
          name="path"
          label={{
            className: "govuk-label--s",
            children: [i18n("addPage.pathField.title")],
          }}
          hint={{
            children: [i18n("addPage.pathField.helpText")],
          }}
          value={path}
          onChange={onChangePath}
          errorMessage={
            errors?.path ? { children: errors?.path?.children } : undefined
          }
        />

        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="page-section">
            {i18n("addPage.sectionOption.title")}
          </label>
          <span className="govuk-hint">
            {i18n("addPage.sectionOption.helpText")}
          </span>
          {sections?.length > 0 && (
            <select
              className="govuk-select"
              id="page-section"
              name="section"
              value={section?.name}
              onChange={onChangeSection}
            >
              <option />
              {sections.map((section) => (
                <option key={section.name} value={section.name}>
                  {section.title}
                </option>
              ))}
            </select>
          )}
          {section?.name && (
            <a
              href="#"
              className="govuk-link govuk-!-display-block"
              onClick={editSection}
            >
              Edit section
            </a>
          )}
          <a
            href="#"
            className="govuk-link govuk-!-display-block"
            onClick={editSection}
          >
            Create section
          </a>
        </div>

        <button type="submit" className="govuk-button">
          Save
        </button>
      </form>
      {isEditingSection && (
        <RenderInPortal>
          <Flyout
            title={`${
              section?.name ? `Editing ${section.name}` : "Add a new section"
            }`}
            onHide={closeFlyout}
            show={true}
          >
            <SectionEdit
              section={section}
              data={data}
              closeFlyout={closeFlyout}
            />
          </Flyout>
        </RenderInPortal>
      )}
    </div>
  );
};

export default withI18n(PageCreate);
