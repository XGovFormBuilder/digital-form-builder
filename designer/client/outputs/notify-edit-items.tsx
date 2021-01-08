import React, { MouseEvent, ChangeEvent } from "react";
import { clone } from "@xgovformbuilder/model";
import { DataContext } from "../context";

type State = {
  items: string[];
};

type Props = {
  data: any; // TODO: type
  items?: string[];
  onEdit: ({ data: any }) => void;
  values: { name: string; display: string }[];
};

class NotifyItems extends React.Component<Props, State> {
  static contextType = DataContext;

  constructor(props: Props) {
    super(props);
    this.state = {
      items: props.items ? clone(props.items) : [],
    };
  }

  onClickAddItem = (_event: MouseEvent) => {
    this.setState((state) => ({
      items: [...state.items, ""],
    }));
  };

  removeItem = (idx: number) => {
    this.setState({
      items: this.state.items.filter((_s, i) => i !== idx),
    });
  };

  onClickDelete = (event: MouseEvent) => {
    event.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    const { data } = this.props;
    const { save } = this.context;
    const copy = clone(data);

    save(copy)
      .then((data) => {
        this.props.onEdit({ data });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  onChangeItem = (event: ChangeEvent<HTMLSelectElement>, index: number) => {
    const { items } = this.state;
    items[index] = event.target.value;
    this.setState({
      items,
    });

    if (
      items.find(
        (item, itemIndex) => item === event.target.value && itemIndex !== index
      )
    ) {
      event.target.setCustomValidity(
        "Duplicate conditions found in the list items"
      );
    } else {
      event.target.setCustomValidity("");
    }
  };

  render() {
    const { items } = this.state;
    const { values } = this.props;

    return (
      <table className="govuk-table">
        <caption className="govuk-table__caption">
          Notify personalisations
          <span className="govuk-hint">
            Notify template keys must match the personalisations in the GOV.UK
            Notify template.
          </span>
        </caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th className="govuk-table__header" scope="col">
              Description
            </th>
            <th className="govuk-table__header" scope="col">
              Notify template key
            </th>
            <th className="govuk-table__header" scope="col">
              <a className="pull-right" href="#" onClick={this.onClickAddItem}>
                Add
              </a>
            </th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {items.map((item, index) => (
            <tr key={item + index} className="govuk-table__row" scope="row">
              <td className="govuk-table__cell">
                <select
                  className="govuk-select"
                  id="link-source"
                  name="personalisation"
                  value={item}
                  onChange={(e) => this.onChangeItem(e, index)}
                  required
                >
                  <option />
                  {values.map((value, i) => (
                    <option key={value.name + i} value={value.name}>
                      {value.display ?? value.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="govuk-table__cell">{item}</td>
              <td className="govuk-table__cell" width="20px">
                <a
                  className="list-item-delete"
                  onClick={() => this.removeItem(index)}
                >
                  &#128465;
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default NotifyItems;
