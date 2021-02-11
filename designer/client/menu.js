import React from "react";
import { Flyout } from "./components/Flyout";
import { DataPrettyPrint } from "./components/DataPrettyPrint/DataPrettyPrint";
import PageCreate from "./page-create";
import LinkCreate from "./link-create";
import ListsEdit from "./list/ListsEdit";
import SectionsEdit from "./section/sections-edit";
import ConditionsEdit from "./conditions/ConditionsEdit";
import FeeEdit from "./fee-edit";
import NotifyEdit from "./outputs/notify-edit";
import DeclarationEdit from "./declaration-edit";
import OutputsEdit from "./outputs/outputs-edit";
import { FormDetails } from "./components/FormDetails";
import { ListContextProvider } from "./reducers/listReducer";
import { ListsEditorContextProvider } from "./reducers/list/listsEditorReducer";
import { DataContext } from "./context";
import { i18n } from "./i18n";

export default class Menu extends React.Component {
  static contextType = DataContext;

  state = {
    tab: "model",
  };

  onClickUpload = (e) => {
    e.preventDefault();
    document.getElementById("upload").click();
  };

  onFileUpload = (e) => {
    const { save } = this.context;
    const { data } = this.props;
    const file = e.target.files.item(0);
    const reader = new window.FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) {
      const content = JSON.parse(evt.target.result);

      for (const page of content.pages) {
        if (!page.title && page.components && page.components.length > 0) {
          page.title = page.components[0].title;
        }
        for (const link of page.next || []) {
          const nextPage = content.pages.find((np) => np.path === link.path);
          if (nextPage && nextPage.condition) {
            link.condition = nextPage.condition;
          }
        }
      }

      for (const page of content.pages) {
        delete page.condition;
      }

      save(content);
    };
  };

  onClickDownload = (e) => {
    const { updateDownloadedAt, data, id } = this.props;
    e.preventDefault();
    const encodedData =
      "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    updateDownloadedAt(new Date().toLocaleTimeString());
    const link = document.createElement("a");
    link.download = `${id}.json`;
    link.href = `data:${encodedData}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  setTab(e, name) {
    e.preventDefault();
    this.setState({ tab: name });
  }

  toggleShowState = (key) => {
    const currentState = this.state[key];
    this.setState({ [key]: !currentState });
  };

  render() {
    const { data } = this.props;
    const { tab } = this.state;

    return (
      <nav className="menu">
        <div className="menu__row">
          <button onClick={() => this.setState({ showFormConfig: true })}>
            Form Details
          </button>

          <button onClick={() => this.setState({ showAddPage: true })}>
            Add Page
          </button>

          <button onClick={() => this.setState({ showAddLink: true })}>
            Add Link
          </button>

          <button onClick={() => this.setState({ showEditSections: true })}>
            Edit Sections
          </button>

          <button onClick={() => this.setState({ showEditConditions: true })}>
            Edit Conditions
          </button>

          <button onClick={() => this.setState({ showEditLists: true })}>
            Edit Lists
          </button>

          <button onClick={() => this.setState({ showEditOutputs: true })}>
            Edit Outputs
          </button>

          <button onClick={() => this.setState({ showEditFees: true })}>
            Edit Fees
          </button>

          <button
            onClick={() => this.setState({ showEditSummaryBehaviour: true })}
          >
            Edit summary behaviour
          </button>

          <button onClick={() => this.setState({ showSummary: true })}>
            Summary
          </button>
        </div>
        <div className="menu__row">
          <a href="/app">Create new form</a>
          <a href="#" onClick={this.onClickUpload}>
            Import saved form
          </a>
          <a onClick={this.onClickDownload} href="#">
            Download form
          </a>
          <input type="file" id="upload" hidden onChange={this.onFileUpload} />
        </div>
        {this.state.showFormConfig && (
          <Flyout
            title="Form Details"
            onHide={() => this.setState({ showFormConfig: false })}
          >
            <FormDetails
              data={data}
              onCreate={() => this.setState({ showFormConfig: false })}
            />
          </Flyout>
        )}
        {this.state.showAddPage && (
          <Flyout
            title="Add Page"
            onHide={() => this.setState({ showAddPage: false })}
          >
            <PageCreate
              data={data}
              onCreate={() => this.setState({ showAddPage: false })}
            />
          </Flyout>
        )}
        {this.state.showAddLink && (
          <Flyout
            title={i18n("menu.links")}
            onHide={() => this.setState({ showAddLink: false })}
          >
            <LinkCreate
              data={data}
              onCreate={() => this.setState({ showAddLink: false })}
            />
          </Flyout>
        )}
        {this.state.showEditSections && (
          <Flyout
            title="Edit Sections"
            onHide={() => this.setState({ showEditSections: false })}
          >
            <SectionsEdit
              data={data}
              onCreate={() => this.setState({ showEditSections: false })}
            />
          </Flyout>
        )}
        {this.state.showEditConditions && (
          <Flyout
            title={i18n("conditions.addOrEdit")}
            onHide={() => this.setState({ showEditConditions: false })}
            width="large"
          >
            <ConditionsEdit
              data={data}
              onCreate={() => this.setState({ showEditConditions: false })}
            />
          </Flyout>
        )}
        {this.state.showEditLists && (
          <Flyout
            title={i18n("list.addOrEdit")}
            onHide={() => this.setState({ showEditLists: false })}
            width={""}
          >
            <ListsEditorContextProvider>
              <ListContextProvider>
                <ListsEdit />
              </ListContextProvider>
            </ListsEditorContextProvider>
          </Flyout>
        )}

        {this.state.showEditFees && (
          <Flyout
            title="Edit Fees"
            onHide={() => this.setState({ showEditFees: false })}
            width="xlarge"
          >
            <FeeEdit
              data={data}
              onEdit={() => this.setState({ showEditFees: false })}
            />
          </Flyout>
        )}
        {this.state.showEditNotify && (
          <Flyout
            title="Edit Notify"
            onHide={() => this.setState({ showEditNotify: false })}
            width="xlarge"
          >
            <NotifyEdit
              data={data}
              onCreate={() => this.setState({ showEditNotify: false })}
            />
          </Flyout>
        )}
        {this.state.showEditDeclaration && (
          <Flyout
            title="Edit Declaration"
            onHide={() => this.setState({ showEditDeclaration: false })}
            width="xlarge"
          >
            <DeclarationEdit
              data={data}
              toggleShowState={this.toggleShowState}
              onCreate={() => this.setState({ showEditDeclaration: false })}
            />
          </Flyout>
        )}
        {this.state.showEditOutputs && (
          <Flyout
            title="Edit Outputs"
            onHide={() => this.setState({ showEditOutputs: false })}
            width="xlarge"
          >
            <OutputsEdit
              data={data}
              toggleShowState={this.toggleShowState}
              onCreate={() => this.setState({ showEditOutputs: false })}
            />
          </Flyout>
        )}
        {this.state.showEditSummaryBehaviour && (
          <Flyout
            title="Edit Summary behaviour"
            onHide={() => this.setState({ showEditSummaryBehaviour: false })}
            width="xlarge"
          >
            <DeclarationEdit
              data={data}
              toggleShowState={this.toggleShowState}
              onCreate={() =>
                this.setState({ showEditSummaryBehaviour: false })
              }
            />
          </Flyout>
        )}
        {this.state.showSummary && (
          <Flyout
            title="Summary"
            width="large"
            onHide={() => this.setState({ showSummary: false })}
          >
            <div className="js-enabled" style={{ paddingTop: "3px" }}>
              <div className="govuk-tabs" data-module="tabs">
                <h2 className="govuk-tabs__title">Summary</h2>
                <ul className="govuk-tabs__list">
                  <li className="govuk-tabs__list-item">
                    <a
                      className="govuk-tabs__tab"
                      href="#"
                      aria-selected={`${tab === "model"}`}
                      onClick={(e) => this.setTab(e, "model")}
                    >
                      Data Model
                    </a>
                  </li>
                  <li className="govuk-tabs__list-item">
                    <a
                      className="govuk-tabs__tab"
                      href="#"
                      aria-selected={`${tab === "json"}`}
                      onClick={(e) => this.setTab(e, "json")}
                    >
                      JSON
                    </a>
                  </li>
                  <li className="govuk-tabs__list-item">
                    <a
                      className="govuk-tabs__tab"
                      href="#"
                      aria-selected={`${tab === "summary"}`}
                      onClick={(e) => this.setTab(e, "summary")}
                    >
                      Summary
                    </a>
                  </li>
                </ul>
                {tab === "model" && (
                  <section className="govuk-tabs__panel">
                    <DataPrettyPrint data={data} />
                  </section>
                )}
                {tab === "json" && (
                  <section className="govuk-tabs__panel">
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                  </section>
                )}
                {tab === "summary" && (
                  <section className="govuk-tabs__panel">
                    <pre>
                      {JSON.stringify(
                        data.pages.map((page) => page.path),
                        null,
                        2
                      )}
                    </pre>
                  </section>
                )}
              </div>
            </div>
          </Flyout>
        )}
      </nav>
    );
  }
}
