import React, { useState } from "react";
import { useEffect } from "react";
import { withI18n } from "./i18n";

const ButtonDropdown = (props) => {
  /* TODO:- generalise this */
  const [showPersonas, setShowPersonas] = useState(false);
  const [value, setValue] = useState({});

  const { i18n } = props;

  useEffect(() => {
    props.updatePersona(value);
  }, [value]);

  const handlePersonaChange = (e) => {
    setValue(JSON.parse(e.target.value));
  };

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
        onClick={() => setShowPersonas(!showPersonas)}
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
              onChange={handlePersonaChange}
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
};

export default withI18n(ButtonDropdown);