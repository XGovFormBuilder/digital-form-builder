import React, { useContext } from "react";
import { Flyout } from "../Flyout";
import { FormDetails } from "../FormDetails";
import PageCreate from "../../page-create";
import LinkCreate from "../../link-create";
import SectionsEdit from "../../section/sections-edit";
import ConditionsEdit from "../../conditions/ConditionsEdit";
import { i18n } from "../../i18n";
import { ListsEditorContextProvider } from "../../reducers/list/listsEditorReducer";
import { ListContextProvider } from "../../reducers/listReducer";
import { FeeEdit } from "../Fee/FeeEdit";
import OutputsEdit from "../../outputs/outputs-edit";
import { DataContext } from "../../context";
import { DataPrettyPrint } from "../DataPrettyPrint/DataPrettyPrint";
import ListsEdit from "../../list/ListsEdit";
import { useMenuItem } from "./useMenuItem";
import { Tabs, useTabs } from "./useTabs";
import { SubMenu } from "./SubMenu";

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
  const summary = useMenuItem();

  const { selectedTab, handleTabChange } = useTabs();

  return (
    <nav className="menu">
      <div className="menu__row">
        <button data-testid="menu-form-details" onClick={formDetails.show}>
          {i18n("menu.formDetails")}
        </button>
        <button data-testid="menu-page" onClick={page.show}>
          {i18n("menu.addPage")}
        </button>
        <button data-testid="menu-links" onClick={link.show}>
          {i18n("menu.links")}
        </button>
        <button data-testid="menu-sections" onClick={sections.show}>
          {i18n("menu.sections")}
        </button>
        <button data-testid="menu-conditions" onClick={conditions.show}>
          {i18n("menu.conditions")}
        </button>
        <button data-testid="menu-lists" onClick={lists.show}>
          {i18n("menu.lists")}
        </button>
        <button data-testid="menu-outputs" onClick={outputs.show}>
          {i18n("menu.outputs")}
        </button>
        <button data-testid="menu-fees" onClick={fees.show}>
          {i18n("menu.fees")}
        </button>
        <button onClick={summary.show} data-testid="menu-summary">
          {i18n("menu.summary")}
        </button>
      </div>
      {formDetails.isVisible && (
        <Flyout title="Form Details" onHide={formDetails.hide}>
          <FormDetails onCreate={() => formDetails.hide()} />
        </Flyout>
      )}

      {page.isVisible && (
        <Flyout title="Add Page" onHide={page.hide}>
          <PageCreate onCreate={() => page.hide()} />
        </Flyout>
      )}

      {link.isVisible && (
        <Flyout title={i18n("menu.links")} onHide={link.hide}>
          <LinkCreate onCreate={() => link.hide()} />
        </Flyout>
      )}

      {sections.isVisible && (
        <Flyout title="Edit Sections" onHide={sections.hide}>
          <SectionsEdit />
        </Flyout>
      )}

      {conditions.isVisible && (
        <Flyout
          title={i18n("conditions.addOrEdit")}
          onHide={conditions.hide}
          width="large"
        >
          <ConditionsEdit />
        </Flyout>
      )}

      {lists.isVisible && (
        <Flyout title="Edit Lists" onHide={lists.hide} width={""}>
          <ListsEditorContextProvider>
            <ListContextProvider>
              <ListsEdit showEditLists={false} />
            </ListContextProvider>
          </ListsEditorContextProvider>
        </Flyout>
      )}

      {outputs.isVisible && (
        <Flyout title="Edit Outputs" onHide={outputs.hide} width="xlarge">
          <OutputsEdit />
        </Flyout>
      )}

      {fees.isVisible && (
        <Flyout title="Edit Fees" onHide={fees.hide} width="xlarge">
          <FeeEdit onEdit={() => fees.hide()} />
        </Flyout>
      )}

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
                <section className="govuk-tabs__panel" data-testid="tab-model">
                  <DataPrettyPrint />
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

      <SubMenu id={id} updateDownloadedAt={updateDownloadedAt} />
    </nav>
  );
}
