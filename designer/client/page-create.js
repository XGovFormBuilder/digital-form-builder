import React from "react";
import { clone } from "@xgovformbuilder/model";
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

class PageCreate extends React.Component {
  static contextType = DataContext;

  constructor(props) {
    super(props);
    const { page } = this.props;
    this.state = {
      path: "/",
      controller: page?.controller ?? "",
      title: page?.title,
      section: page?.section ?? {},
      isEditingSection: false,
      errors: {},
    };
  }

  onSubmit = async (e) => {
    e.preventDefault();

    const { data } = this.props;
    const { save } = this.context;

    const title = this.state.title?.trim();
    const linkFrom = this.state.linkFrom?.trim();
    const section = this.state.section?.name?.trim();
    const pageType = this.state.pageType?.trim();
    const selectedCondition = this.state.selectedCondition?.trim();
    const path = this.state.path;

    let validationErrors = this.validate(title, path);
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

    let copy = clone(data);

    copy = copy.addPage(value);

    if (linkFrom) {
      copy = copy.addLink(linkFrom, path, selectedCondition);
    }
    try {
      await save(copy);
      this.props.onCreate({ value });
    } catch (err) {
      console.error(err);
    }
  };

  validate = (title, path) => {
    const { data, i18n } = this.props;
    const titleErrors = validateTitle("page-title", title, i18n);
    const errors = { ...titleErrors };
    const pathHasErrors = data.findPage(path);
    if (pathHasErrors) {
      errors.path = {
        href: "#page-path",
        children: `Path '${path}' already exists`,
      };
    }

    this.setState({ errors });

    return errors;
  };

  generatePath(title, data) {
    let path = toUrl(title);

    let count = 1;
    while (data.findPage(path)) {
      if (count > 1) {
        path = path.substr(0, path.length - 2);
      }
      path = `${path}-${count}`;
      count++;
    }
    return path;
  }

  findSectionWithName(name) {
    const { data } = this.props;
    const { sections } = data;
    return sections.find((section) => section.name === name);
  }

  onChangeSection = (e) => {
    this.setState({
      section: this.findSectionWithName(e.target.value),
    });
  };

  onChangeLinkFrom = (e) => {
    const input = e.target;
    this.setState({
      linkFrom: input.value,
    });
  };

  onChangePageType = (e) => {
    const input = e.target;
    this.setState({
      pageType: input.value,
    });
  };

  onChangeTitle = (e) => {
    const { data } = this.props;
    const input = e.target;
    const title = input.value;
    this.setState({
      title: title,
      path: this.generatePath(title, data),
    });
  };

  onChangePath = (e) => {
    const input = e.target;
    const path = input.value.startsWith("/") ? input.value : `/${input.value}`;
    const sanitisedPath = path.replace(/\s/g, "-");
    this.setState({
      path: sanitisedPath,
    });
  };

  conditionSelected = (selectedCondition) => {
    this.setState({
      selectedCondition: selectedCondition,
    });
  };

  editSection = (e, section) => {
    e.preventDefault();
    this.setState({
      section,
      isEditingSection: true,
    });
  };

  closeFlyout = (sectionName) => {
    const propSection = this.state.section ?? {};
    this.setState({
      isEditingSection: false,
      section: sectionName
        ? this.findSectionWithName(sectionName)
        : propSection,
    });
  };

  render() {
    const { data, i18n } = this.props;
    const { sections, pages } = data;
    const {
      pageType,
      linkFrom,
      title,
      section,
      path,
      isEditingSection,
      errors,
    } = this.state;

    return (
      <div>
        {hasValidationErrors(errors) > 0 && (
          <ErrorSummary errorList={Object.values(errors)} />
        )}
        <form onSubmit={(e) => this.onSubmit(e)} autoComplete="off">
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
              onChange={this.onChangePageType}
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
              onChange={this.onChangeLinkFrom}
            >
              <option />
              {pages.map((page) => (
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
              conditionsChange={this.conditionSelected}
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
              children: [i18n("addPage.pathField.title")],
            }}
            hint={{
              children: [i18n("addPage.pathField.helpText")],
            }}
            value={path}
            onChange={this.onChangePath}
            errorMessage={
              errors?.path ? { children: errors?.path?.children } : undefined
            }
          />

          <div className="govuk-form-group">
            <label
              className="govuk-label govuk-label--s"
              htmlFor="page-section"
            >
              {i18n("addPage.sectionOption.title")}
            </label>
            <span className="govuk-hint">
              {i18n("addPage.sectionOption.helpText")}
            </span>
            {sections.length > 0 && (
              <select
                className="govuk-select"
                id="page-section"
                name="section"
                value={section?.name}
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
            {section?.name && (
              <a
                href="#"
                className="govuk-link govuk-!-display-block"
                onClick={this.editSection}
              >
                Edit section
              </a>
            )}
            <a
              href="#"
              className="govuk-link govuk-!-display-block"
              onClick={this.editSection}
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
              onHide={this.closeFlyout}
              show={true}
            >
              <SectionEdit
                section={section}
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

export default withI18n(PageCreate);
