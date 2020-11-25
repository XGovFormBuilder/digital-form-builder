import React from "react";
import { Textarea } from "@govuk-jsx/textarea";
import { Input } from "@govuk-jsx/input";
import SelectConditions from "../conditions/select-conditions";
import { icons } from "../icons";
import Flyout from "../flyout";
import { clone } from "@xgovformbuilder/model";
import DefineChildComponent from "./define-child-component";
import { RenderInPortal } from "./render-in-portal";
import { isEmpty } from "../helpers";

export default class DefineComponentValue extends React.Component {
  constructor(props) {
    super(props);
    const value = props.value;
    this.state = value ? clone(value) : { children: [] };
    if (!this.state.children) {
      this.state.children = [];
    }
    this.state.errors = {};
  }

  saveItem = () => {
    const { label, value, hint, condition, children } = this.state;

    let compHasErrors = this.validate();
    if (compHasErrors) return;

    this.props.saveCallback({
      label,
      value,
      hint,
      condition,
      children,
    });
  };

  validate = () => {
    const { label, value } = this.state;

    let labelHasError = isEmpty(label);
    let valueHasError = isEmpty(value);

    this.setState({
      errors: {
        label: labelHasError,
        value: valueHasError,
      },
    });
    return labelHasError || valueHasError;
  };

  onClickCancel = () => {
    this.props.cancelCallback();
  };

  showAddChild = () => this.setState({ showAddChild: true });

  cancelAddChild = () => this.setState({ showAddChild: false });

  showEditChild = (index) => this.setState({ editingIndex: index });

  cancelEditChild = () => this.setState({ editingIndex: undefined });

  addChild = (component) => {
    const { children } = this.state;
    children.push(component);
    this.setState({
      children: children,
      showAddChild: false,
    });
  };

  updateChild = (component) => {
    const { children, editingIndex } = this.state;
    children[editingIndex] = component;
    this.setState({
      children,
      editingIndex: undefined,
    });
  };

  removeChild = (index) => {
    const { children } = this.state;
    children.splice(index, 1);
    this.setState({ children: children });
  };

  conditionSelected = (condition) => {
    this.setState({
      condition: condition,
    });
  };

  render() {
    const {
      label,
      value,
      hint,
      condition,
      children,
      showAddChild,
      editingIndex,
      errors,
    } = this.state;
    const { data, page } = this.props;
    const child = children[editingIndex];

    return (
      <div>
        <Input
          id="item-label"
          name="label"
          label={{
            className: "govuk-label--s",
            children: ["Label"],
          }}
          hint={{
            children: ["Text can include HTML"],
          }}
          value={label}
          onChange={(e) => this.setState({ label: e.target.value })}
          errorMessage={
            errors?.label ? { children: ["Enter label"] } : undefined
          }
        />
        <Input
          id="item-value"
          name="value"
          label={{
            className: "govuk-label--s",
            children: ["Value"],
          }}
          hint={{
            children: ["Text can include HTML"],
          }}
          value={value}
          onChange={(e) => this.setState({ value: e.target.value })}
          errorMessage={
            errors?.value ? { children: ["Enter value"] } : undefined
          }
        />
        <Textarea
          id="item-hint"
          name="hint"
          rows={2}
          label={{
            className: "govuk-label--s",
            children: ["Hint (optional)"],
          }}
          hint={{
            children: ["Text can include HTML"],
          }}
          value={hint}
          onChange={(e) => this.setState({ hint: e.target.value })}
        />
        <SelectConditions
          data={data}
          path={page.path}
          selectedCondition={condition}
          conditionsChange={this.conditionSelected}
          hints={[
            "The item will only be displayed if the selected condition holds",
          ]}
        />
        <div>
          <table className="govuk-table">
            <caption className="govuk-table__caption">Children</caption>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th
                  className="govuk-table__header"
                  scope="col"
                  colSpan="2"
                ></th>
                <th className="govuk-table__header" scope="col">
                  <a
                    className="pull-right"
                    id="add-child-link"
                    href="#"
                    onClick={this.showAddChild}
                  >
                    Add New Item
                  </a>
                </th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {children.map((item, index) => (
                <tr
                  key={`item-row-${index}`}
                  className="govuk-table__row"
                  scope="row"
                >
                  <td className="govuk-table__cell">
                    <h2 id={`child-details-${index}`} className="govuk-label">
                      {item.title || item.name} ({item.type})
                    </h2>
                  </td>
                  <td className="govuk-table__cell">
                    <a
                      className="list-item-delete"
                      id={`edit-child-${index}`}
                      onClick={() => this.showEditChild(index)}
                    >
                      {icons.edit(false)}
                    </a>
                  </td>
                  <td className="govuk-table__cell">
                    <a
                      className="list-item-delete"
                      id={`remove-child-${index}`}
                      onClick={() => this.removeChild(index)}
                    >
                      &#128465;
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <a
            href="#"
            id="save-component-value-link"
            className="govuk-button"
            onClick={this.saveItem}
          >
            Add Item
          </a>{" "}
          <a
            href="#"
            id="cancel-add-component-value-link"
            className="govuk-button"
            onClick={this.onClickCancel}
          >
            Cancel
          </a>
          {!!showAddChild && (
            <RenderInPortal>
              <Flyout
                title="Add Child"
                show={!!showAddChild}
                onHide={this.cancelAddChild}
              >
                <form>
                  <DefineChildComponent
                    data={data}
                    page={page}
                    saveCallback={this.addChild}
                    cancelCallback={this.cancelAddChild}
                    EditComponentView={this.props.EditComponentView}
                  />
                </form>
              </Flyout>
            </RenderInPortal>
          )}
          {editingIndex !== undefined && (
            <RenderInPortal>
              <Flyout
                title="Edit Child"
                show={editingIndex !== undefined}
                onHide={this.cancelEditChild}
              >
                <form>
                  <DefineChildComponent
                    data={data}
                    component={child}
                    page={page}
                    saveCallback={this.updateChild}
                    cancelCallback={this.cancelEditChild}
                    EditComponentView={this.props.EditComponentView}
                  />
                </form>
              </Flyout>
            </RenderInPortal>
          )}
        </div>
      </div>
    );
  }
}
