import React from "react";
import ReactDOM from "react-dom";
import { LandingChoice, NewConfig, ChooseExisting } from "./pages/LandingPage";
import "./styles/index.scss";
import { initI18n } from "./i18n";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import Designer from "./designer";

initI18n();

function NoMatch() {
  return <div>404 Not found</div>;
}

export class App extends React.Component {
  state = {
    id: "",
    flyoutCount: 0,
    isNavigatingBack: false,
  };

  designerApi = new DesignerApi();

  componentDidMount() {
    this.setState({ newConfig: window.newConfig ?? false }, () => {
      if (!this.state.loaded && !this.state.newConfig) {
        this.setState({ id: window.id, previewUrl: window.previewUrl }, () => {
          const dataPromise = this.designerApi.fetchData(this.state.id);
          dataPromise.then((data) => {
            this.setState({ loaded: true, data: new Data(data) });
          });
        });
      }
    });
  }

  getId = () => {
    return nanoid();
  };

  setFunctions = (data) => {
    data.getId = this.getId;
  };

  updateDownloadedAt = (time) => {
    this.setState({ downloadedAt: time });
  };

  setStateId = (id) => {
    this.setState({ id });
  };

  incrementFlyoutCounter = (callback = () => {}) => {
    let currentCount = this.state.flyoutCount;
    this.setState({ flyoutCount: ++currentCount }, callback());
  };

  decrementFlyoutCounter = (callback = () => {}) => {
    let currentCount = this.state.flyoutCount;
    this.setState({ flyoutCount: --currentCount }, callback());
  };

  save = async (toUpdate, callback = () => {}) => {
    const { id } = this.state;
    await this.designerApi.save(id, toUpdate);
    this.setState(
      { data: new Data(toUpdate), updatedAt: new Date().toLocaleTimeString() },
      callback()
    );
    return new Data(toUpdate);
  };

  render() {
    const { previewUrl, id, flyoutCount, newConfig, data, page } = this.state;
    const flyoutContextProviderValue = {
      flyoutCount,
      increment: this.incrementFlyoutCounter,
      decrement: this.decrementFlyoutCounter,
    };
    const dataContextProviderValue = { data, save: this.save };
    if (newConfig) {
      return (
        <div id="app">
          <Switch>
            <Route path="/designer/:id" component={Designer} />
            <Route path="/" exact>
              <LandingChoice />
            </Route>
            <Route path="/new" exact>
              <NewConfig />
            </Route>
            <Route path="/choose-existing" exact>
              <ChooseExisting />
            </Route>
            <Route path="*">
              <NoMatch />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
