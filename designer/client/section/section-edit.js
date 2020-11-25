import React from "react";
import { clone } from "@xgovformbuilder/model";
import Name from "../name";
import { nanoid } from "nanoid";
import { withI18n } from "../i18n";
import { Input } from "@govuk-jsx/input";

class SectionEdit extends React.Component {
  constructor(props) {
    super(props);
    this.closeFlyout = props.closeFlyout;
    const { section } = props;
    this.isNewSection = !section?.name;

    this.state = {
      name: section?.name ?? nanoid(6),
      title: section?.title ?? "",
      errors: {},
    };
  }

  async onSubmit(e) {
    e.preventDefault();
    const { name, title } = this.state;
    let hasErrors = this.validate(title);
    if (hasErrors) return;
    const { data } = this.props;
    const copy = clone(data);
    if (this.isNewSection) {
      copy.addSection(name, title.trim());
    } else {
      const previousName = this.props.section?.name;
      const nameChanged = previousName !== name;
      const copySection = copy.sections.find(
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
      await data.save(copy);
      this.closeFlyout(name);
    } catch (err) {
      console.error(err);
    }
  }

  onChangeTitle = (e) => {
    this.setState({
      title: e.target.value,
    });
  };

  validate = (title) => {
    let titleHasErrors = !title || title.trim().length < 1;
    this.setState((prevState, props) => ({
      errors: {
        ...prevState.errors,
        title: titleHasErrors,
      },
    }));
    return titleHasErrors;
  };

  onClickDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm("Confirm delete")) {
      return;
    }

    const { data, section } = this.props;
    const copy = clone(data);
    const previousName = this.props.section?.name;

    copy.sections.splice(data.sections.indexOf(section), 1);

    // Update any references to the section
    copy.pages.forEach((p) => {
      if (p.section === previousName) {
        delete p.section;
      }
    });

    try {
      await data.save(copy);
      this.closeFlyout({});
    } catch (error) {
      // TODO:- we should really think about handling these errors properly.
      console.log(error);
    }
  };

  render() {
    const { i18n } = this.props;
    const { title, name, errors } = this.state;

    return (
      <form onSubmit={(e) => this.onSubmit(e)} autoComplete="off">
        <Input
          id="section-title"
          name="title"
          label={{
            className: "govuk-label--s",
            children: [i18n("title")],
          }}
          value={title}
          onChange={this.onChangeTitle}
          errorMessage={
            errors?.title ? { children: ["Enter title"] } : undefined
          }
        />
        <Name id="section-name" labelText="Section name" name={name} />
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
    );
  }
}

export default withI18n(SectionEdit);
