import React, { Component } from "react"; //TODO:- remove this when implemented properly!
/* eslint-disable */
 export default class RouteChecker extends Component<{data}> {
  render() {
    const { data } = this.props;
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
      <form onSubmit={(e) => this.onSubmit(e)} autoComplete="off">
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="link-source">
            From
          </label>
          <select
            className="govuk-select"
            id="link-source"
            name="path"
            onChange={(e) => this.storeValue(e, "from")}
            required
          >
            <option />
          </select>
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="link-target">
            To
          </label>
          <select
            className="govuk-select"
            id="link-target"
            name="page"
            onChange={(e) => this.storeValue(e, "to")}
            required
          >
            <option />
          </select>
        </div>
        <button className="govuk-button" type="submit">
          Save
        </button>
      </form>
    
    
    );
  }
}
