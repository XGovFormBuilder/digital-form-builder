import React, { useContext, useState } from "react";
import { Flyout } from "../Flyout";
import { FormDetails } from "../FormDetails";
import PageCreate from "../../page-create";
import LinkCreate from "../../link-create";
import SectionsEdit from "../../section/sections-edit";
import ConditionsEdit from "../../conditions/ConditionsEdit";
import { i18n } from "../../i18n";
import { ListsEditorContextProvider } from "../../reducers/list/listsEditorReducer";
import { ListContextProvider } from "../../reducers/listReducer";
import FeeEdit from "../../fee-edit";
import DeclarationEdit from "../../declaration-edit";
import OutputsEdit from "../../outputs/outputs-edit";
import { DataContext } from "../../context";
import { DataPrettyPrint } from "../DataPrettyPrint/DataPrettyPrint";
import ListsEdit from "../../list/ListsEdit";
import { useMenuItem } from "./useMenuItem";
import { Tabs, useTabs } from "./useTabs";

type Props = {
  updateDownloadedAt?: (string) => void;
  id: string;
};

export default function Menu({ updateDownloadedAt, id }: Props) {
  const { data } = useContext(DataContext);

  const formDetails = useMenuItem();
  const page = useMenuItem();
  const link = useMenuItem();
  const sections = useMenuItem();
  const conditions = useMenuItem();
  const lists = useMenuItem();
  const outputs = useMenuItem();
  const fees = useMenuItem();
  const summaryBehaviour = useMenuItem();
  const summary = useMenuItem();

  const { selectedTab, handleTabChange } = useTabs();

  const onClickUpload = (e) => {
    e.preventDefault();
    document.getElementById("upload").click();
  };

  const onClickDownload = (e) => {
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
        <button data-testid="menu-form-details" onClick={formDetails.show}>
          {i18n("menu.formDetails")}
        </button>
        {formDetails.isVisible && (
          <Flyout title="Form Details" onHide={formDetails.hide}>
            <FormDetails onCreate={() => formDetails.hide} />
          </Flyout>
        )}

        <button data-testid="menu-page" onClick={page.show}>
          {i18n("menu.addPage")}
        </button>
        {page.isVisible && (
          <Flyout title="Add Page" onHide={page.hide}>
            <PageCreate data={data} onCreate={() => page.hide} />
          </Flyout>
        )}

        <button data-testid="menu-links" onClick={link.show}>
          {i18n("menu.links")}
        </button>
        {link.isVisible && (
          <Flyout title={i18n("menu.links")} onHide={link.hide}>
            <LinkCreate data={data} onCreate={() => link.hide} />
          </Flyout>
        )}

        <button data-testid="menu-sections" onClick={sections.show}>
          {i18n("menu.sections")}
        </button>
        {sections.isVisible && (
          <Flyout title="Edit Sections" onHide={sections.hide}>
            <SectionsEdit data={data} onCreate={() => sections.hide} />
          </Flyout>
        )}

        <button data-testid="menu-conditions" onClick={conditions.show}>
          {i18n("menu.conditions")}
        </button>
        {conditions.isVisible && (
          <Flyout
            title={i18n("conditions.addOrEdit")}
            onHide={conditions.hide}
            width="large"
          >
            <ConditionsEdit data={data} onCreate={() => conditions.hide} />
          </Flyout>
        )}

        <button data-testid="menu-lists" onClick={lists.show}>
          {i18n("menu.lists")}
        </button>
        {lists.isVisible && (
          <Flyout title="Edit Lists" onHide={lists.hide} width={""}>
            <ListsEditorContextProvider>
              <ListContextProvider>
                <ListsEdit isEditingFromComponent={false} />
              </ListContextProvider>
            </ListsEditorContextProvider>
          </Flyout>
        )}

        <button data-testid="menu-outputs" onClick={outputs.show}>
          {i18n("menu.outputs")}
        </button>
        {outputs.isVisible && (
          <Flyout title="Edit Outputs" onHide={outputs.hide} width="xlarge">
            <OutputsEdit data={data} onCreate={outputs.hide} />
          </Flyout>
        )}

        <button data-testid="menu-fees" onClick={fees.show}>
          {i18n("menu.fees")}
        </button>
        {fees.isVisible && (
          <Flyout title="Edit Fees" onHide={fees.hide} width="xlarge">
            <FeeEdit data={data} onEdit={() => fees.hide} />
          </Flyout>
        )}

        <button
          data-testid="menu-summary-behaviour"
          onClick={summaryBehaviour.show}
        >
          {i18n("menu.summaryBehaviour")}
        </button>
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

        <button onClick={summary.show} data-testid="menu-summary">
          {i18n("menu.summary")}
        </button>
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
                      onClick={(e) => handleTabChange(e, Tabs.model)}
                    >
                      Data Model
                    </button>
                  </li>
                  <li className="govuk-tabs__list-item">
                    <button
                      className="govuk-tabs__tab"
                      aria-selected={selectedTab === Tabs.json}
                      data-testid={"tab-json-button"}
                      onClick={(e) => handleTabChange(e, Tabs.json)}
                    >
                      JSON
                    </button>
                  </li>
                  <li className="govuk-tabs__list-item">
                    <button
                      className="govuk-tabs__tab"
                      aria-selected={selectedTab === Tabs.summary}
                      data-testid="tab-summary-button"
                      onClick={(e) => handleTabChange(e, Tabs.summary)}
                    >
                      Summary
                    </button>
                  </li>
                </ul>
                {selectedTab === Tabs.model && (
                  <section
                    className="govuk-tabs__panel"
                    data-testid="tab-model"
                  >
                    <DataPrettyPrint data={data} />
                  </section>
                )}
                {selectedTab === Tabs.json && (
                  <section className="govuk-tabs__panel" data-testid="tab-json">
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                  </section>
                )}
                {selectedTab === Tabs.summary && (
                  <section
                    className="govuk-tabs__panel"
                    data-testid="tab-summary"
                  >
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
    </nav>
  );
}
