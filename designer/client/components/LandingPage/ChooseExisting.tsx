import React, { Component } from "react";
import * as formConfigurationApi from "../../load-form-configurations";
import { withI18n } from "../../i18n";
import { withRouter } from "react-router-dom";
import { BackLink } from "../BackLink";
import "./LandingPage.scss";

type Props = {
  i18n(text: string): string;
  history?: any;
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
    //TODO get config name
    const newResponse = await window
      .fetch("/api/new", {
        method: "POST",
        body: JSON.stringify({
          selected: { Key: form },
          name: "",
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => res.json());
    this.props.history.push(`designer/${newResponse.id}`);
  };

  goBack = (event) => {
    this.props.history.goBack();
  };

  render() {
    const { i18n } = this.props;
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

          <h2 className="govuk-heading-2">Select an existing form</h2>

          <div className="govuk-form-group form__list">
            <ol className="govuk-list">
              <li>Form name</li>
              <hr />
              {hasEditableForms ? (
                <>{formList}</>
              ) : (
                <p>You do not have any existing forms</p>
              )}
            </ol>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(withI18n(ChooseExisting));
