import React, { Component } from "react";
import Menu from "./menu";
import { Visualisation } from "./components/Visualisation";
import { Data } from "@xgovformbuilder/model";
import { customAlphabet } from "nanoid";
import { FlyoutContext, DataContext } from "./context";
import { FeatureFlagProvider } from "./context/FeatureFlagContext";
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
 * result in broken conditions.
 */
const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz",
  10
);

export default class Designer extends Component<Props, State> {
  state = { loading: true, flyoutCount: 0 };

  designerApi = new DesignerApi();

  getId = () => {
    return nanoid();
  };

  get id() {
    return this.props.match?.params?.id;
  }

  updateDownloadedAt = (time) => {
    this.setState({ downloadedAt: time });
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
    await this.designerApi.save(this.id, toUpdate);
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
    this.designerApi.fetchData(id).then((data) => {
      this.setState({ loading: false, data: new Data(data) });
    });
  }

  render() {
    const { flyoutCount, data, loading } = this.state;
    const { previewUrl } = window;
    if (loading) {
      return <p>Loading ...</p>;
    }

    const flyoutContextProviderValue = {
      count: flyoutCount,
      increment: this.incrementFlyoutCounter,
      decrement: this.decrementFlyoutCounter,
    };
    const dataContextProviderValue = { data, save: this.save };

    return (
      <FeatureFlagProvider>
        <DataContext.Provider value={dataContextProviderValue}>
          <FlyoutContext.Provider value={flyoutContextProviderValue}>
            <div id="app">
              <Menu
                data={data}
                id={this.id}
                updateDownloadedAt={this.updateDownloadedAt}
                updatePersona={this.updatePersona}
              />
              <Visualisation
                downloadedAt={this.state.downloadedAt}
                updatedAt={this.state.updatedAt}
                persona={this.state.persona}
                id={this.id}
                previewUrl={previewUrl}
              />
            </div>
          </FlyoutContext.Provider>
        </DataContext.Provider>
      </FeatureFlagProvider>
    ); //
  }
}
