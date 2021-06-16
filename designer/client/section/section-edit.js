import React from "react";
import randomId from "../randomId";
import { withI18n } from "../i18n";
import { Input } from "@govuk-jsx/input";
import {
  validateName,
  validateTitle,
  hasValidationErrors,
} from "../validations";
import ErrorSummary from "../error-summary";
import { DataContext } from "../context";
import { addSection } from "../data";
import logger from "../plugins/logger";

class SectionEdit extends React.Component {
  static contextType = DataContext;

  constructor(props) {
    super(props);
    this.closeFlyout = props.closeFlyout;
    const { section } = props;
    this.isNewSection = !section?.name;
    this.nameRef = React.createRef();
    this.state = {
      name: section?.name ?? randomId(),
      title: section?.title ?? "",
      errors: {},
    };
  }

  async onSubmit(e) {
    e.preventDefault();
    let validationErrors = this.validate();

    if (hasValidationErrors(validationErrors)) return;

    const { data, save } = this.context;
    const { name, title } = this.state;
    let updated = { ...data };

    if (this.isNewSection) {
      updated = addSection(data, { name, title: title.trim() });
    } else {
      const previousName = this.props.section?.name;
      const nameChanged = previousName !== name;
      const copySection = updated.sections.find(
        (section) => section.name === previousName
      );

      if (nameChanged) {
        copySection.name = name;
        /**
         * @code removing any references to the section
         */
        copy.pages.forEach((p) => {
          if (p.section === previousName) {
            p.section = name;
          }
        });
      }
      copySection.title = title;
    }

    try {
      await save(updated);
      this.closeFlyout(name);
    } catch (err) {
      logger.error("SectionEdit", err);
    }
  }

  validate = () => {
    const { i18n } = this.props;
    const { name, title } = this.state;
    const titleErrors = validateTitle("section-title", title, i18n);
    const nameErrors = validateName("section-name", "section name", name, i18n);
    const errors = { ...titleErrors, ...nameErrors };
    this.setState({ errors });
    return errors;
  };

  onClickDelete = async (e) => {
    e.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    const { save } = this.context;
    const { data, section } = this.props;
    const copy = { ...data };
    const previousName = this.props.section?.name;

    copy.sections.splice(copy.sections.indexOf(section), 1);

    // Update any references to the section
    copy.pages.forEach((p) => {
      if (p.section === previousName) {
        delete p.section;
      }
    });

    try {
      await save(copy);
      this.closeFlyout("");
    } catch (error) {
      logger.error("SectionEdit", error);
    }
  };

  render() {
    const { i18n } = this.props;
    const { title, name, errors } = this.state;

    return (
      <>
        {Object.keys(errors).length > 0 && (
          <ErrorSummary errorList={Object.values(errors)} />
        )}
        <form onSubmit={(e) => this.onSubmit(e)} autoComplete="off">
          <Input
            id="section-title"
            name="title"
            hint={{
              children: [i18n("sectionEdit.titleField.helpText")],
            }}
            label={{
              className: "govuk-label--s",
              children: [i18n("sectionEdit.titleField.title")],
            }}
            value={title}
            onChange={(e) => this.setState({ title: e.target.value })}
            errorMessage={
              errors?.title ? { children: errors?.title.children } : undefined
            }
          />
          <Input
            id="section-name"
            name="name"
            className="govuk-input--width-20"
            label={{
              className: "govuk-label--s",
              children: [i18n("sectionEdit.nameField.title")],
            }}
            hint={{
              children: [i18n("sectionEdit.nameField.helpText")],
            }}
            value={name}
            onChange={(e) => this.setState({ name: e.target.value })}
            errorMessage={
              errors?.name ? { children: errors?.name.children } : undefined
            }
          />
          <button className="govuk-button" type="submit">
            Save
          </button>{" "}
          {!this.isNewSection && (
            <button
              className="govuk-button"
              type="button"
              onClick={this.onClickDelete}
            >
              {i18n("delete")}
            </button>
          )}
        </form>
      </>
    );
  }
}

export default withI18n(SectionEdit);
