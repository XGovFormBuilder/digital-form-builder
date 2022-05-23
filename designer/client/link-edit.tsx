import React, { Component, useContext, useState } from "react";
import SelectConditions from "./conditions/SelectConditions";
import { clone } from "@xgovformbuilder/model";
import { i18n } from "./i18n";

import { DataContext } from "./context";
import { findPage } from "./data";
import { updateLink } from "./data/page";
import logger from "./plugins/logger";

const LinkEdit = (props) => {
  const { data, save } = useContext(DataContext);
  const { edge } = props;
  const [page] = findPage(data, edge.source);
  const [link, setLink] = useState(
    page.next?.find((n) => n.path === edge.target)
  );
  const [selectedCondition, setSelectedCondition] = useState(link?.condition);

  const { pages } = data;

  const onSubmit = async (e) => {
    e.preventDefault();

    const updatedData = updateLink(
      data,
      page.path,
      link?.path,
      selectedCondition
    );

    try {
      await save(updatedData);
      props.onEdit();
    } catch (err) {
      logger.error("LinkEdit", err);
    }
  };

  const onClickDelete = (e) => {
    e.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    const copy = { ...data };
    const [copyPage] = findPage(data, page.path);
    const copyLinkIdx = copyPage.next?.findIndex((n) => n.path === link?.path);
    copyPage.next?.splice(copyLinkIdx, 1);
    copy.pages = copy.pages.map((page) =>
      page.path === copyPage.path ? copyPage : page
    );

    save(copy)
      .then((data) => {
        props.onEdit({ data });
      })
      .catch((err) => {
        logger.error("LinkEdit", err);
      });
  };

  const conditionSelected = (selectedCondition) => {
    setSelectedCondition(selectedCondition);
  };

  return (
    <form onSubmit={(e) => onSubmit(e)} autoComplete="off">
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor="link-source">
          From
        </label>
        <select
          value={edge.source}
          className="govuk-select"
          id="link-source"
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
        conditionsChange={conditionSelected}
        noFieldsHintText={i18n("addLink.noFieldsAvailable")}
      />
      <button className="govuk-button" type="submit">
        Save
      </button>
      &nbsp;
      <button className="govuk-button" type="button" onClick={onClickDelete}>
        Delete
      </button>
    </form>
  );
};

export default LinkEdit;
