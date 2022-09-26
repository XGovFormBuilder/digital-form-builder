import React from "react";
import SelectConditions from "./conditions/SelectConditions";
import { clone } from "@xgovformbuilder/model";
import { i18n } from "./i18n";

import { DataContext } from "./context";
import { findPage } from "./data";
import { updateLink } from "./data/page";
import logger from "../client/plugins/logger";

class LinkEdit extends React.Component {
  static contextType = DataContext;

  constructor(props, context) {
    super(props, context);
    const { data } = this.context;
    const { edge } = this.props;
    const [page] = findPage(data, edge.source);
    const link = page.next.find((n) => n.path === edge.target);

    this.state = {
      page: page,
      link: link,
      selectedCondition: link.condition,
    };
  }

  onSubmit = async (e) => {
    e.preventDefault();
    const { link, page, selectedCondition } = this.state;
    const { data, save } = this.context;
    const updatedData = updateLink(
      data,
      page.path,
      link.path,
      selectedCondition
    );

    try {
      await save(updatedData);
      this.props.onEdit();
    } catch (err) {
      logger.error("LinkEdit", err);
    }
  };

  onClickDelete = (e) => {
    e.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    const { link, page } = this.state;
    const { data, save } = this.context;

    const copy = { ...data };
    const [copyPage] = findPage(data, page.path);
    const copyLinkIdx = copyPage.next.findIndex((n) => n.path === link.path);
    copyPage.next.splice(copyLinkIdx, 1);
    copy.pages = copy.pages.map((page) =>
      page.path === copyPage.path ? copyPage : page
    );

    save(copy)
      .then((data) => {
        this.props.onEdit({ data });
      })
      .catch((err) => {
        logger.error("LinkEdit", err);
      });
  };

  render() {
    const { data, edge } = this.props;
    const { pages } = data;
    const { selectedCondition } = this.state;
    return (
      <form onSubmit={(e) => this.onSubmit(e)} autoComplete="off">
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="link-source">
            From
          </label>
          <select
            value={edge.source}
            className="govuk-select"
            id="link-source"
            name="link-source"
            disabled
          >
            <option />
            {pages.map((page) => (
              <option key={page.path} value={page.path}>
                {page.title}
              </option>
            ))}
          </select>
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="link-target">
            To
          </label>
          <select
            value={edge.target}
            className="govuk-select"
            id="link-target"
            name="link-target"
            disabled
          >
            <option />
            {pages.map((page) => (
              <option key={page.path} value={page.path}>
                {page.title}
              </option>
            ))}
          </select>
        </div>
        <SelectConditions
          path={edge.source}
          selectedCondition={selectedCondition}
          conditionsChange={this.conditionSelected}
          noFieldsHintText={i18n("addLink.noFieldsAvailable")}
        />
        <button className="govuk-button" type="submit">
          Save
        </button>
        &nbsp;
        <button
          className="govuk-button"
          type="button"
          onClick={this.onClickDelete}
        >
          Delete
        </button>
      </form>
    );
  }

  conditionSelected = (selectedCondition) => {
    this.setState({
      selectedCondition: selectedCondition,
    });
  };
}

export default LinkEdit;
