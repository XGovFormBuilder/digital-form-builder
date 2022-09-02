import React, { Component } from "react";
import * as formConfigurationApi from "../../load-form-configurations";
import { i18n } from "../../i18n";
import { withRouter } from "react-router-dom";
import { BackLink } from "../../components/BackLink";
import "./LandingPage.scss";
import logger from "../../plugins/logger";

type Props = {
  history: any;
};

type State = {
  configs: { Key: string; DisplayName: string }[];
  loading?: boolean;
};

export class ChooseExisting extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configs: [],
      loading: true,
    };
  }

  componentDidMount() {
    formConfigurationApi.loadConfigurations().then((configs) => {
      this.setState({
        loading: false,
        configs,
      });
    });
  }

  selectForm = async (form) => {
    try {
      const response = await window.fetch("/api/new", {
        method: "POST",
        body: JSON.stringify({
          selected: { Key: form },
          name: "",
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const responseJson = await response.json();
      // useNavigate(`/designer/${responseJson.id}`);
      // this.props.history.push(`/designer/${responseJson.id}`);
    } catch (e) {
      logger.error("ChooseExisting", e);
    }
  };

  goBack = (event) => {
    event.preventDefault();
    this.props.history.goBack();
  };

  render() {
    const configs = this.state.configs || [];
    const hasEditableForms = configs.length > 0;
    if (this.state.loading) {
      return <p>Loading ...</p>;
    }

    const formTable = configs.map((form) => (
      <tr className="govuk-table__row" key={form.Key}>
        <td className="govuk-table__cell">
          <a
            className="govuk-link"
            href=""
            onClick={(e) => {
              e.preventDefault();
              this.selectForm(form.Key);
            }}
          >
            {form.DisplayName}
          </a>
        </td>
      </tr>
    ));

    return (
      <div className="new-config">
        <div>
          <BackLink onClick={this.goBack}>
            {i18n("Back to previous page")}
          </BackLink>

          <h1 className="govuk-heading-l">
            {i18n("landingPage.existing.select")}
          </h1>

          <div className="govuk-grid-row form-grid">
            <div className="govuk-grid-column-two-thirds">
              <table className="govuk-table">
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">
                      Form name
                    </th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {hasEditableForms ? (
                    <>{formTable}</>
                  ) : (
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell table__cell__noborder">
                        {i18n("landingPage.existing.noforms")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ChooseExisting);
