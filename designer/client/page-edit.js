import React from "react";
import { Input } from "@govuk-jsx/input";
import { clone } from "@xgovformbuilder/model";
import randomId from "./randomId";

import { toUrl } from "./helpers";
import { RenderInPortal } from "./components/RenderInPortal";
import SectionEdit from "./section/section-edit";
import { Flyout } from "./components/Flyout";
import { withI18n } from "./i18n";
import ErrorSummary from "./error-summary";
import { validateTitle, hasValidationErrors } from "./validations";
import { DataContext } from "./context";

import FeatureToggle from "./FeatureToggle";
import { FeatureFlags } from "./context/FeatureFlagContext";
import { findPage, updateLinksTo } from "./data";
import logger from "../client/plugins/logger";

export class PageEdit extends React.Component {
  static contextType = DataContext;

  constructor(props) {
    super(props);
    const { page } = this.props;
    this.state = {
      path: page?.path ?? this.generatePath(page.title),
      controller: page?.controller ?? "",
      title: page?.title ?? "",
      section: page?.section ?? "",
      isEditingSection: false,
      errors: {},
    };
    this.formEditSection = React.createRef();
  }

  onSubmit = async (e) => {
    e.preventDefault();
    const { save, data } = this.context;
    const { title, path, section, controller } = this.state;
    const { page } = this.props;

    let validationErrors = this.validate(title, path);
    if (hasValidationErrors(validationErrors)) return;

    let copy = { ...data };
    const [copyPage, copyIndex] = findPage(data, page.path);
    const pathChanged = path !== page.path;

    if (pathChanged) {
      copy = updateLinksTo(data, page.path, path);
      copyPage.path = path;
      if (copyIndex === 0) {
        copy.startPage = path;
      }
    }

    copyPage.title = title;
    section ? (copyPage.section = section) : delete copyPage.section;
    controller
      ? (copyPage.controller = controller)
      : delete copyPage.controller;

    copy.pages[copyIndex] = copyPage;
    try {
      await save(copy);
      this.props.onEdit();
    } catch (err) {
      logger.error("PageEdit", err);
    }
  };

  validate = (title, path) => {
    const { page, i18n } = this.props;
    const { data } = this.context;
    const titleErrors = validateTitle("page-title", title, i18n);
    const errors = { ...titleErrors };

    let pathHasErrors = false;
    if (path !== page.path)
      pathHasErrors = data.pages.find((page) => page.path === path);
    if (pathHasErrors) {
      errors.path = {
        href: "#page-path",
        children: `Path '${path}' already exists`,
      };
    }

    this.setState({ errors });

    return errors;
  };

  onClickDelete = async (e) => {
    e.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    const { save, data } = this.context;
    const { page } = this.props;
    const copy = clone(data);

    const copyPageIdx = copy.pages.findIndex((p) => p.path === page.path);

    // Remove all links to the page
    copy.pages.forEach((p, index) => {
      if (index !== copyPageIdx && Array.isArray(p.next)) {
        for (let i = p.next.length - 1; i >= 0; i--) {
          const next = p.next[i];
          if (next.path === page.path) {
            p.next.splice(i, 1);
          }
        }
      }
    });

    copy.pages.splice(copyPageIdx, 1);
    try {
      await save(copy);
    } catch (error) {
      logger.error("PageEdit", error);
    }
  };

  onClickDuplicate = async (e) => {
    e.preventDefault();
    const { page } = this.props;
    const { data, save } = this.context;
    const copy = clone(data);
    const duplicatedPage = clone(page);
    duplicatedPage.path = `${duplicatedPage.path}-${randomId()}`;
    duplicatedPage.components.forEach((component) => {
      component.name = `${duplicatedPage.path}-${randomId()}`;
    });
    copy.pages.push(duplicatedPage);
    try {
      await save(copy);
    } catch (err) {
      logger.error("PageEdit", err);
    }
  };

  onChangeTitle = (e) => {
    const title = e.target.value;
    this.setState({
      title: title,
      path: this.generatePath(title),
    });
  };

  onChangePath = (e) => {
    const input = e.target.value;
    const path = input.startsWith("/") ? input : `/${input}`;
    this.setState({
      path: path.replace(/\s/g, "-"),
    });
  };

  generatePath(title) {
    let path = toUrl(title);
    const { data } = this.context;
    const { page } = this.props;
    if (data.pages.find((page) => page.path === path) && page.title !== title) {
      path = `${path}-${randomId()}`;
    }
    return path;
  }

  editSection = (e, newSection = false) => {
    e.preventDefault();
    this.setState({
      isEditingSection: true,
      isNewSection: newSection,
    });
  };

  closeFlyout = (sectionName) => {
    const propSection = this.state.section ?? this.props.page?.section ?? "";
    this.setState({
      isEditingSection: false,
      section: sectionName,
    });
  };

  onChangeSection = (e) => {
    this.setState({
      section: e.target.value,
    });
  };

  findSectionWithName(name) {
    const { data } = this.context;
    const { sections } = data;
    return sections.find((section) => section.name === name);
  }

  render() {
    const { i18n } = this.props;
    const { data } = this.context;
    const { sections } = data;
    const {
      title,
      path,
      controller,
      section,
      isEditingSection,
      isNewSection,
      errors,
    } = this.state;

    return (
      <div data-testid="page-edit">
        {Object.keys(errors).length > 0 && (
          <ErrorSummary errorList={Object.values(errors)} />
        )}
        <form onSubmit={this.onSubmit} autoComplete="off">
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="page-type">
              {i18n("page.type")}
            </label>
            <span className="govuk-hint">{i18n("page.typeHint")}</span>
            <select
              className="govuk-select"
              id="page-type"
              name="page-type"
              value={controller}
              onChange={(e) => this.setState({ controller: e.target.value })}
            >
              <option value="">{i18n("page.types.question")}</option>
              <option value="./pages/start.js">
                {i18n("page.types.start")}
              </option>
              <option value="./pages/summary.js">
                {i18n("page.types.summary")}
              </option>
              <option value="CheckpointSummaryPage">
                Non-submitting Summary Page
              </option>
            </select>
          </div>
          <Input
            id="page-title"
            name="title"
            label={{
              className: "govuk-label--s",
              children: [i18n("page.title")],
            }}
            value={title}
            onChange={this.onChangeTitle}
            errorMessage={
              errors?.title ? { children: errors?.title.children } : undefined
            }
          />
          <Input
            id="page-path"
            name="path"
            label={{
              className: "govuk-label--s",
              children: [i18n("page.path")],
            }}
            hint={{
              children: [i18n("page.pathHint")],
            }}
            value={path}
            onChange={this.onChangePath}
            errorMessage={
              errors?.path ? { children: errors.path?.children } : undefined
            }
          />
          <div className="govuk-form-group">
            <label
              className="govuk-label govuk-label--s"
              htmlFor="page-section"
            >
              {i18n("page.section")}
            </label>
            <span className="govuk-hint">{i18n("page.sectionHint")}</span>
            {sections.length > 0 && (
              <select
                className="govuk-select"
                id="page-section"
                name="section"
                value={section}
                onChange={this.onChangeSection}
              >
                <option />
                {sections.map((section) => (
                  <option key={section.name} value={section.name}>
                    {section.title}
                  </option>
                ))}
              </select>
            )}
            {section && (
              <a
                href="#"
                className="govuk-link govuk-!-display-block"
                onClick={this.editSection}
              >
                {i18n("section.edit")}
              </a>
            )}
            {!section && (
              <a
                href="#"
                className="govuk-link govuk-!-display-block"
                onClick={(e) => this.editSection(e, true)}
              >
                {i18n("section.create")}
              </a>
            )}
          </div>
          <button className="govuk-button" type="submit">
            {i18n("save")}
          </button>{" "}
          <FeatureToggle
            feature={FeatureFlags.FEATURE_EDIT_PAGE_DUPLICATE_BUTTON}
          >
            <button
              className="govuk-button"
              type="button"
              onClick={this.onClickDuplicate}
            >
              {i18n("duplicate")}
            </button>{" "}
          </FeatureToggle>
          <button
            className="govuk-button"
            type="button"
            onClick={this.onClickDelete}
          >
            {i18n("delete")}
          </button>
        </form>
        {isEditingSection && (
          <RenderInPortal>
            <Flyout
              title={
                section?.name
                  ? i18n("section.editingTitle", { title: section.title })
                  : i18n("section.newTitle")
              }
              onHide={this.closeFlyout}
              show={isEditingSection}
            >
              <SectionEdit
                section={isNewSection ? {} : this.findSectionWithName(section)}
                data={data}
                closeFlyout={this.closeFlyout}
              />
            </Flyout>
          </RenderInPortal>
        )}
      </div>
    );
  }
}

export default withI18n(PageEdit);
