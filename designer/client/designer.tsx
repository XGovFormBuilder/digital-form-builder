import React, { Component } from "react";
import Menu from "./menu";
import { Visualisation } from "./components/Visualisation";
import { NewConfig } from "./components/NewConfig";
import { Data } from "@xgovformbuilder/model";
import { customAlphabet } from "nanoid";
import { FlyoutContext, DataContext } from "./context";
import { DesignerApi } from "./api/designerApi";

interface Props {
  match?: any;
  location?: any;
  history?: any;
}
interface State {
  id?: any;
  flyoutCount?: number;
  loading?: boolean;
  error?: string; // not using as of now
  newConfig?: boolean; // TODO - is this required?
  data?: any;
  page?: any;
  updatedAt?: any;
  downloadedAt?: any;
}

/**
 * Custom alphabet is required because '-' is used as a symbol in
 * expr-eval (condition logic) so components which include a '-' in the name
 * result in broken conditions
 */
const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz",
  10
);

export default class Designer extends Component<Props, State> {
  state = { loading: true };

  designerApi = new DesignerApi();

  save = (updatedData) => {
    return window
      .fetch(`/api/${this.state.id}/data`, {
        method: "put",
        body: JSON.stringify(updatedData),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (!res.ok) {
          throw Error(res.statusText);
        }
      })
      .catch(() => {
        // Not connected to preview environment
      })
      .finally(() => {
        this.setFunctions(updatedData);
        this.setState({
          data: updatedData,
          updatedAt: new Date().toLocaleTimeString(),
        });
        return updatedData;
      });
  };

  getId = () => {
    return nanoid();
  };

  setFunctions = (data) => {
    data.save = this.save;
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

  saveData = async (toUpdate, callback = () => {}) => {
    const { id } = this.state;
    const dataJson = await this.designerApi.save(id, toUpdate);
    this.setState(
      { data: new Data(toUpdate), updatedAt: new Date().toLocaleTimeString() },
      callback()
    );
    return new Data(toUpdate);
  };

  updatePageContext = (page) => {
    this.setState({ page });
  };

  componentDidMount() {
    const id = this.props.match?.params?.id;
    this.setState({ id });
    const dataPromise = this.designerApi.fetchData(id);
    dataPromise.then((data) => {
      this.setState({ loading: false, data: new Data(data) });
    });
  }

  render() {
    const { id, flyoutCount, data, page, loading } = this.state;
    if (loading) {
      return <p>Loading ...</p>;
    }

    const flyoutContextProviderValue = {
      flyoutCount,
      increment: this.incrementFlyoutCounter,
      decrement: this.decrementFlyoutCounter,
    };
    const dataContextProviderValue = { data, save: this.saveData };

    return (
      <DataContext.Provider value={dataContextProviderValue}>
        <FlyoutContext.Provider value={flyoutContextProviderValue}>
          <div id="app">
            <Menu
              data={data}
              id={this.state.id}
              updateDownloadedAt={this.updateDownloadedAt}
              updatePersona={this.updatePersona}
            />
            <Visualisation
              data={data}
              downloadedAt={this.state.downloadedAt}
              updatedAt={this.state.updatedAt}
              persona={this.state.persona}
              id={id}
              previewUrl={previewUrl}
            />
          </div>
        </FlyoutContext.Provider>
      </DataContext.Provider>
    ); //
  }
}
