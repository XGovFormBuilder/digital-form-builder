import React from "react";
import ReactDOM from "react-dom";
import Menu from "./menu";
import { Visualisation } from "./components/Visualisation";
import { NewConfig } from "./components/NewConfig";
import { Data } from "@xgovformbuilder/model";
import { customAlphabet } from "nanoid";
import { FlyoutContext, DataContext } from "./context";
import "./styles/index.scss";
import { initI18n } from "./i18n";
import { DesignerApi } from "./api/designerApi";
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";
import Designer from "./designer";

initI18n();

function NoMatch() {
  return <div>404 Not found</div>;
}

export class App extends React.Component {
  render() {
    return (
      <Router>
        <div id="app">
          <Switch>
            <Route path="/designer/:id" component={Designer} />
            <Route path="/" exact>
              <NewConfig />
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
