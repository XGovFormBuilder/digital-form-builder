import React, { useContext, useState } from "react";
import ListItems from "./list-items";
import { clone } from "@xgovformbuilder/model";
import { withI18n } from "../i18n";
import { Hint } from "@govuk-jsx/hint";
import { Label } from "@govuk-jsx/label";
import { ErrorMessage } from "@govuk-jsx/error-message";
import { nanoid } from "nanoid";
import { DataContext } from "./../context";
import { RenderInPortal } from "../components/render-in-portal";
import Flyout from "../flyout";
import ListItemEdit from "./list-item-edit";
import { ComponentContext } from "../reducers/component/componentReducer";

class ListEdit extends React.Component {
  static contextType = DataContext;

  constructor(props) {
    super(props);

    this.state = {
      type: props.list?.type ?? "string",
      list: props.list || {
        title: "",
        name: nanoid(6),
        type: "string",
        items: [],
      },
      titleHasError: false,
      isNew: !props.list?.name,
      isEditingListItem: false,
    };
  }

  onSubmit = async (e) => {
    e.preventDefault();
    const { data, save } = this.context;
    const { list: updatedList } = this.state;
    const copy = clone(data);
  };

  // TODO:- move this to a reducer
  submitToLists = async (e) => {
    const { data, save } = this.context;
    const { list: updatedList } = this.state;
    const copy = clone(data);
    const dataList =
      copy.lists?.find((list) => list.name === updatedList.name) ?? {};

    if (!dataList.name) {
      copy.lists.push(updatedList);
    }

    copy.lists.find((list) => list.name === updatedList.name).title =
      updatedList.title;
    const updatedData = await save(copy);
    this.setState({ isNew: false });
    this.props.setSelectedList(
      updatedData.lists.find((list) => list.name === updatedList.name)
    );
  };

  // TODO:- move this to a reducer
  submitToComponent = async (e) => {
    e.preventDefault();
    const { data, save } = this.context;
    const { list: updatedList } = this.state;
    const copy = clone(data);
  };

  onClickDelete = (e) => {
    e.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    const { data, list } = this.props;
    const copy = clone(data);

    const affectedComponents = copy.pages
      .flatMap((p) => p.components)
      .filter(
        (component) =>
          component.values?.type === "listRef" &&
          component.values.list === list.name
      );

    // Flag anything we are breaking to the user
    let aborted = false;
    if (affectedComponents.length > 0) {
      aborted = !window.confirm(`The following components will no longer function correctly:\n\n
      ${affectedComponents.map((it) => it.type + ": " + it.title + "\n\n")}
      Are you sure you want to proceed?`);
    }
    if (!aborted) {
      // Remove the list
      copy.lists.splice(data.lists.indexOf(list), 1);
      // Update any references to the list
      affectedComponents.forEach((c) => {
        delete c.values;
      });
      data
        .save(copy)
        .then((data) => {
          console.log(data);
          this.props.onEdit({ data });
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  onChangeTitle = (e) => {
    const { list } = this.state;
    const title = e.target.value;
    this.setState({
      list: { ...list, title },
      titleHasError: title?.trim().length < 1,
    });
  };

  onCreateClick = (e) => {
    e.preventDefault();
    this.setState({ isEditingListItem: true });
  };

  cancelAddItem = (e, item) => {
    e?.preventDefault();
    // this.setState({ isEditingListItem: false });
  };

  selectListItem = (item) => {
    this.setState({ isEditingListItem: true, selectedItem: item });
  };

  render() {
    const {
      type,
      list,
      titleHasError,
      isNew,
      isEditingListItem,
      selectedItem,
    } = this.state;
    const { i18n, conditions } = this.props;
    return (
      <div>
        <form onSubmit={this.onSubmit} autoComplete="off">
          <div
            className={`govuk-form-group ${
              titleHasError ? "govuk-form-group--error" : ""
            }`}
          >
            <Label htmlFor="list-title">{i18n("list.title")}</Label>
            <Hint>{i18n("wontShow")}</Hint>
            {titleHasError && (
              <ErrorMessage>{i18n("errors.required")}</ErrorMessage>
            )}
            <input
              className={`govuk-input govuk-input--width-20 ${
                titleHasError ? "govuk-input--error" : ""
              }`}
              id="list-title"
              name="title"
              type="text"
              value={list.title}
              onChange={this.onChangeTitle}
            />
          </div>
          <ListItems
            list={list}
            type={type}
            conditions={conditions}
            isNew={isNew}
            selectListItem={this.selectListItem}
          />
          {!isNew && (
            <a
              className="govuk-link govuk-body govuk-!-display-block govuk-!-margin-bottom-1"
              href="#"
              onClick={this.onCreateClick}
            >
              {i18n("list.createListItem")}
            </a>
          )}
          <button
            className="govuk-button"
            type="submit"
            disabled={titleHasError || !list.title}
          >
            Save
          </button>{" "}
          {!isNew && (
            <a href="#" className="govuk-link" onClick={this.onClickDelete}>
              {i18n("delete")}
            </a>
          )}
        </form>
        {isEditingListItem && (
          <RenderInPortal>
            <Flyout
              title="Add Item"
              show={isEditingListItem}
              width={""}
              onHide={this.cancelAddItem}
            >
              <ListItemEdit list={list} selectedItem={selectedItem} />
            </Flyout>
          </RenderInPortal>
        )}
      </div>
    );
  }
}

export default withI18n(ListEdit);
