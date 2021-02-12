import React, { useContext, useState } from "react";
import { Flyout } from "../Flyout";
import { FormDetails } from "../FormDetails";
import PageCreate from "../../page-create";
import LinkCreate from "../../link-create";
import SectionsEdit from "../../section/sections-edit";
import ConditionsEdit from "../../conditions/ConditionsEdit";
import { i18n } from "../../i18n";
import { ListsEditorContextProvider } from "../../reducers/list/listsEditorReducer";
import ListsEdit from "../../list/lists-edit";
import { ListContextProvider } from "../../reducers/listReducer";
import FeeEdit from "../../fee-edit";
import NotifyEdit from "../../outputs/notify-edit";
import DeclarationEdit from "../../declaration-edit";
import OutputsEdit from "../../outputs/outputs-edit";
import { DataContext } from "../../context";
import { DataPrettyPrint } from "../DataPrettyPrint/DataPrettyPrint";

type MenuItemHook = {
  isVisible: boolean;
  show: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  hide: (e?: React.MouseEvent<HTMLButtonElement>) => void;
};

function useMenuItem(): MenuItemHook {
  const [isVisible, setIsVisible] = useState(false);

  function show(e) {
    e?.preventDefault();
    setIsVisible(true);
  }

  function hide(e) {
    e?.preventDefault();
    setIsVisible(false);
  }

  return {
    isVisible,
    show,
    hide,
  };
}

enum Tabs {
  model,
  json,
  summary,
}
function useTabs() {
  const [selectedTab, setSelectedTab] = useState(Tabs.model);
  function handleTabChange(tab: Tabs) {
    setSelectedTab(tab);
  }

  return { selectedTab, handleTabChange };
}

export function Menu() {
  const { data } = useContext(DataContext);

  const formConfig = useMenuItem(),
    page = useMenuItem(),
    link = useMenuItem(),
    sections = useMenuItem(),
    conditions = useMenuItem(),
    lists = useMenuItem(),
    outputs = useMenuItem(),
    fees = useMenuItem(),
    summaryBehaviour = useMenuItem(),
    summary = useMenuItem(),
    notify = useMenuItem();

  const { selectedTab, handleTabChange } = useTabs();

  const onClickUpload = (e) => {
    e.preventDefault();
    document.getElementById("upload").click();
  };

  const onFileUpload = (e) => {
    const { save } = useContext(DataContext);
    const file = e.target.files.item(0);
    const reader = new window.FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) {
      const content = JSON.parse(evt.target.result);
      save(content);
    };
  };

  return (
    <nav className="menu">
      <div className="menu__row">
        <button onClick={formConfig.show}>Form Details</button>
        {formConfig.isVisible && (
          <Flyout title="Form Details" onHide={formConfig.hide}>
            <FormDetails onCreate={() => formConfig.hide} />
          </Flyout>
        )}

        <button onClick={page.show}>Add Page</button>
        {page.isVisible && (
          <Flyout title="Add Page" onHide={page.hide}>
            <PageCreate data={data} onCreate={() => page.hide} />
          </Flyout>
        )}

        <button onClick={link.show}>Add Link</button>
        {link.isVisible && (
          <Flyout title={i18n("menu.links")} onHide={link.hide}>
            <LinkCreate data={data} onCreate={() => link.hide} />
          </Flyout>
        )}

        <button onClick={sections.show}>Edit Sections</button>
        {sections.isVisible && (
          <Flyout title="Edit Sections" onHide={sections.hide}>
            <SectionsEdit data={data} onCreate={() => sections.hide} />
          </Flyout>
        )}

        <button onClick={conditions.show}>Edit Conditions</button>
        {conditions.isVisible && (
          <Flyout
            title={i18n("conditions.addOrEdit")}
            onHide={conditions.hide}
            width="large"
          >
            <ConditionsEdit data={data} onCreate={() => conditions.hide} />
          </Flyout>
        )}

        <button onClick={lists.show}>Edit Lists</button>
        {lists.isVisible && (
          <Flyout title="Edit Lists" onHide={lists.hide} width={""}>
            <ListsEditorContextProvider>
              <ListContextProvider>
                <ListsEdit />
              </ListContextProvider>
            </ListsEditorContextProvider>
          </Flyout>
        )}

        <button onClick={outputs.show}>Edit Outputs</button>
        {outputs.isVisible && (
          <Flyout title="Edit Outputs" onHide={outputs.hide} width="xlarge">
            <OutputsEdit data={data} onCreate={outputs.hide} />
          </Flyout>
        )}

        <button onClick={fees.show}>Edit Fees</button>
        {fees.isVisible && (
          <Flyout title="Edit Fees" onHide={fees.hide} width="xlarge">
            <FeeEdit data={data} onEdit={() => fees.hide} />
          </Flyout>
        )}

        <button onClick={summaryBehaviour.show}>Edit summary behaviour</button>
        {summaryBehaviour.isVisible && (
          <Flyout
            title="Edit Summary behaviour"
            onHide={summaryBehaviour.hide}
            width="xlarge"
          >
            <DeclarationEdit
              data={data}
              onCreate={() => summaryBehaviour.hide}
            />
          </Flyout>
        )}

        <button onClick={summary.show}>Summary</button>
        {summary.isVisible && (
          <Flyout title="Summary" width="large" onHide={summary.hide}>
            <div className="js-enabled" style={{ paddingTop: "3px" }}>
              <div className="govuk-tabs" data-module="tabs">
                <h2 className="govuk-tabs__title">Summary</h2>
                <ul className="govuk-tabs__list">
                  <li className="govuk-tabs__list-item">
                    <button
                      className="govuk-tabs__tab"
                      aria-selected={selectedTab === Tabs.model}
                      onClick={handleTabChange(Tabs.model)}
                    >
                      Data Model
                    </button>
                  </li>
                  <li className="govuk-tabs__list-item">
                    <button
                      className="govuk-tabs__tab"
                      aria-selected={selectedTab === Tabs.json}
                      onClick={handleTabChange(Tabs.json)}
                    >
                      JSON
                    </button>
                  </li>
                  <li className="govuk-tabs__list-item">
                    <button
                      className="govuk-tabs__tab"
                      aria-selected={selectedTab === Tabs.summary}
                      onClick={handleTabChange(Tabs.summary)}
                    >
                      Summary
                    </button>
                  </li>
                </ul>
                {selectedTab === Tabs.model && (
                  <section className="govuk-tabs__panel">
                    <DataPrettyPrint data={data} />
                  </section>
                )}
                {selectedTab === Tabs.json && (
                  <section className="govuk-tabs__panel">
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                  </section>
                )}
                {selectedTab === Tabs.summary && (
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
      </div>
      <div className="menu__row">
        <a href="/app">Create new form</a>
        <a href="#" onClick={onClickUpload}>
          Import saved form
        </a>
        <a onClick={onClickDownload} href="#">
          Download form
        </a>
        <input type="file" id="upload" hidden onChange={onFileUpload} />
      </div>

      {notify.isVisible && (
        <Flyout title="Edit Notify" onHide={notify.hide} width="xlarge">
          <NotifyEdit data={data} onCreate={() => notify.hide} />
        </Flyout>
      )}
    </nav>
  );
}
