import React from "react";
import ReactDOM from "react-dom";
import { LandingChoice, NewConfig, ChooseExisting } from "./pages/LandingPage";
import "./styles/index.scss";
import { initI18n } from "./i18n";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Designer from "./designer";
import { SaveError } from "./pages/ErrorPages";

initI18n();

function NoMatch() {
  return <div>404 Not found</div>;
}

export class App extends React.Component {
  render() {
    return (
      <Router basename="/app">
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
            <Route path="/save-error" exact>
              <SaveError />
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
