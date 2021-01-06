import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.scss";
import { initI18n } from "./i18n";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";
import { NewConfig } from "./components/newConfig";
import { Provider } from "react-redux";
import store from "./store";
import Designer from "./designer";

initI18n();

export class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div id="app">
            <Switch>
              <Route path="/new" exact>
                <NewConfig />
              </Route>
              <Route path="/:id">
                <Designer />
              </Route>
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
