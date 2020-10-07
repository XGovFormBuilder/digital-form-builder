import React from "react";
import ComponentTypeEdit from "./component-type-edit";
import { clone, ComponentTypes } from "@xgovformbuilder/model";
import { DataContext } from "./context";

/**
 * @deprecated (keeping until tests are refactored)
 */
class ComponentCreate extends React.Component {
  static contextType = DataContext;
  state = {
    isSaving: false,
  };

  async componentDidMount() {
    this.setState({ name: nanoid(6) });
  }

  async onSubmit(e) {
    e.preventDefault();

    if (this.state.isSaving) {
      return;
    }

    this.setState({ isSaving: true });

    const { page } = this.props;
    const { data, save } = this.context;
    const { component } = this.state;
    const copy = clone(data);
    const updated = copy.addComponent(page.path, component);
    await save(updated);
    this.setState({ isSaving: false });
  }

  storeComponent = (component) => {
    this.setState({ component });
  };

  render() {
    const { page, allowedTypes = ComponentTypes } = this.props;
    const { isSaving } = this.state;

    return (
      <div>
        <form onSubmit={(e) => this.onSubmit(e)} autoComplete="off">
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="type">
              Type
            </label>
            <select
              className="govuk-select"
              id="type"
              name="type"
              required
              onChange={(e) =>
                this.setState({ component: { type: e.target.value } })
              }
            >
              <option />
              {allowedTypes
                .sort((a, b) => (a.title ?? "").localeCompare(b.title))
                .map((type) => {
                  return (
                    <option key={type.name} value={type.name}>
                      {type.title}
                    </option>
                  );
                })}
            </select>
          </div>

          {this.state?.component?.type && (
            <div>
              <ComponentTypeEdit page={page} />
              <button
                type="submit"
                className="govuk-button"
                disabled={isSaving}
              >
                Save
              </button>
            </div>
          )}
        </form>
      </div>
    );
  }
}

export default ComponentCreate;
