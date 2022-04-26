import React from "react";
import { withI18n } from "./i18n";

class ButtonDropdown extends React.Component {
  /* TODO:- generalise thi */
  constructor(props) {
    super(props);
    this.state = {
      showPersonas: false,
      value: {},
    };
  }

  handlePersonaChange = (e) => {
    this.setState({ value: JSON.parse(e.target.value) }, () => {
      this.props.updatePersona(this.state.value);
    });
  };

  render() {
    const showPersonas = this.state.showPersonas;
    const { value } = this.state;
    const { i18n } = this.props;
    const personas = [
      {
        id: "a",
        paths: ["/ceremony", "/no-civil-partnership"],
      },
      {
        id: "b",
        paths: ["/ceremony", "/opposite-or-same-sex", "/no-same-sex-marriage"],
      },
      {
        id: "c",
        paths: [
          "/ceremony",
          "/opposite-or-same-sex",
          "/complete-affirmation",
          "/how-to-get-an-affirmation",
        ],
      },
    ];

    return (
      <div>
        <button
          className="govuk-button govuk-!-font-size-14"
          onClick={() =>
            this.setState({ showPersonas: !this.state.showPersonas })
          }
        >
          {i18n("Personas")} {!showPersonas ? "🔽" : "🔼"}
        </button>
        {showPersonas && (
          <div className="menu-dropdown">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--s" htmlFor="persona">
                {i18n("Persona")}
              </label>
              <select
                className="govuk-select"
                id="persona"
                name="persona"
                onChange={this.handlePersonaChange}
                value={JSON.stringify(value)}
                required
              >
                <option />
                {personas.map((persona) => (
                  <option key={persona.id} value={JSON.stringify(persona)}>
                    {persona.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withI18n(ButtonDropdown);
