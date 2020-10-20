import React from "react";
import {
  SortableContainer,
  SortableElement,
  arrayMove,
  SortableHandle,
} from "react-sortable-hoc";
import { clone } from "@xgovformbuilder/model";

function headDuplicate(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] === arr[i]) {
        return j;
      }
    }
  }
}

const DragHandle = SortableHandle(() => (
  <span className="drag-handle-list">&#9776;</span>
));

const SortableItem = SortableElement(
  ({ index, item, type, conditions, onBlur, onBlurValue, removeItem }) => {
    return (
      <tr className="govuk-table__row" scope="row">
        <td className="govuk-table__cell">
          <DragHandle />
        </td>
        <td className="govuk-table__cell">
          <input
            className="govuk-input"
            name="text"
            type="text"
            defaultValue={item.text}
            required
            onBlur={onBlur}
          />
        </td>
        <td className="govuk-table__cell">
          {type === "number" ? (
            <input
              className="govuk-input"
              name="value"
              type="number"
              defaultValue={item.value}
              required
              onBlur={onBlur}
              step="any"
            />
          ) : (
            <input
              className="govuk-input"
              name="value"
              type="text"
              defaultValue={item.value}
              required
              onBlur={onBlur}
            />
          )}
        </td>
        <td className="govuk-table__cell">
          <input
            className="govuk-input"
            name="description"
            type="text"
            defaultValue={item.description}
            onBlur={onBlur}
          />
        </td>
        <td className="govuk-table__cell">
          <select
            className="govuk-select"
            id={`link-source-${index}`}
            name="condition"
            defaultValue={item.condition}
          >
            <option />
            {(conditions || []).map((condition, i) => (
              <option key={condition.name + index} value={condition.name}>
                {condition.displayName}
              </option>
            ))}
          </select>
        </td>
        <td className="govuk-table__cell" width="20px">
          <a className="list-item-delete" onClick={() => removeItem(index)}>
            &#128465;
          </a>
        </td>
      </tr>
    );
  }
);

const SortableList = SortableContainer(
  ({ items, conditions, type, removeItem, onBlur }) => {
    console.log("items", items);
    return (
      <tbody className="govuk-table__body">
        {items.map((item, index) => (
          <SortableItem
            key={`item-${index}`}
            item={item}
            index={index}
            conditions={conditions}
            type={type}
            onBlur={onBlur}
            removeItem={removeItem}
          />
        ))}
      </tbody>
    );
  }
);

class ListItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: clone(props.items) || [],
    };
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState(({ items }) => ({
      items: arrayMove(items, oldIndex, newIndex),
    }));
  };

  onClickAddItem = (e) => {
    this.setState({
      items: this.state.items.concat({
        text: "",
        value: "",
        description: "",
        conditional: "",
      }),
    });
  };

  removeItem = (idx) => {
    this.setState({
      items: this.state.items.filter((s, i) => i !== idx),
    });
  };

  onClickDelete = (e) => {
    e.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    const { data, list } = this.props;
    const copy = clone(data);

    // Remove the list
    copy.lists.splice(data.lists.indexOf(list), 1);

    // Update any references to the list
    copy.pages.forEach((p) => {
      if (p.list === list.name) {
        delete p.list;
      }
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
  };

  onBlur = (e) => {
    const form = e.target.form;
    const formData = new window.FormData(form);
    const texts = formData.getAll("text").map((t) => t.trim());
    const values = formData.getAll("value").map((t) => t.trim());

    // Only validate dupes if there is more than one item
    if (texts.length < 2) {
      return;
    }

    form.elements.text.forEach((el) => el.setCustomValidity(""));
    form.elements.value.forEach((el) => el.setCustomValidity(""));

    // Validate uniqueness
    const dupeText = headDuplicate(texts);
    if (dupeText) {
      form.elements.text[dupeText].setCustomValidity(
        "Duplicate texts found in the list items"
      );
      return;
    }

    const dupeValue = headDuplicate(values);
    if (dupeValue) {
      form.elements.value[dupeValue].setCustomValidity(
        "Duplicate values found in the list items"
      );
    }
  };

  render() {
    const { items } = this.state;
    const { type, conditions } = this.props;

    return (
      <table className="govuk-table">
        <caption className="govuk-table__caption">Items</caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th className="govuk-table__header" scope="col" />
            <th className="govuk-table__header" scope="col">
              Text
            </th>
            <th className="govuk-table__header" scope="col">
              Value
            </th>
            <th className="govuk-table__header" scope="col">
              Description
            </th>
            <th className="govuk-table__header" scope="col">
              Condition
            </th>
            <th className="govuk-table__header" scope="col">
              <a className="pull-right" href="#" onClick={this.onClickAddItem}>
                Add
              </a>
            </th>
          </tr>
        </thead>
        <SortableList
          type={type}
          items={items || []}
          conditions={conditions}
          removeItem={this.removeItem}
          onBlur={this.onBlur}
          onSortEnd={this.onSortEnd}
          helperClass="dragging"
          lockToContainerEdges
          useDragHandle
        />
        {/* sortable list */}
      </table>
    );
  }
}

export default ListItems;
