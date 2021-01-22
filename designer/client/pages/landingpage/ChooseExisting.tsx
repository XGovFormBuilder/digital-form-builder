import React, { Component } from "react";
import * as formConfigurationApi from "../../load-form-configurations";
import { i18n } from "../../i18n";
import { withRouter } from "react-router-dom";
import { BackLink } from "../../components/BackLink";
import "./LandingPage.scss";

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
      this.props.history.push(`/designer/${responseJson.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  goBack = (event) => {
    this.props.history.goBack();
  };

  render() {
    const configs = this.state.configs || [];
    const hasEditableForms = configs.length > 0;
    if (this.state.loading) {
      return <p>Loading ...</p>;
    }

    const formList = configs.map((form) => (
      <li key={form.Key}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            this.selectForm(form.Key);
          }}
        >
          {form.DisplayName}
        </a>
        <hr />
      </li>
    ));

    return (
      <div className="new-config">
        <div>
          <BackLink onClick={this.goBack}>
            {i18n("Back to previous page")}
          </BackLink>

          <h2 className="govuk-heading-2">
            {i18n("landingPage.existing.select")}
          </h2>

          <div className="govuk-form-group form__list">
            <ol className="govuk-list">
              <li>Form name</li>
              <hr />
              {hasEditableForms ? (
                <>{formList}</>
              ) : (
                <p>{i18n("landingPage.existing.noforms")}</p>
              )}
            </ol>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ChooseExisting);
