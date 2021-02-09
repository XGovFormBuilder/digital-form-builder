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

export function Menu() {
  const formConfig = useMenuItem(),
    page = useMenuItem(),
    link = useMenuItem(),
    sections = useMenuItem(),
    conditions = useMenuItem(),
    lists = useMenuItem(),
    outputs = useMenuItem(),
    fees = useMenuItem(),
    summaryBehaviour = useMenuItem(),
    summary = useMenuItem();

  const { data } = useContext(DataContext);

  return (
    <nav className="menu">
      <div className="menu__row">
        <button onClick={formConfig.show}>Form Details</button>
        {formConfig.isVisible && (
          <Flyout title="Form Details" onHide={formConfig.hide}>
            <FormDetails data={{}} onCreate={() => formConfig.hide} />
          </Flyout>
        )}

        <button onClick={page.show}>Add Page</button>

        <button onClick={link.show}>Add Link</button>

        <button onClick={sections.show}>Edit Sections</button>

        <button onClick={conditions.show}>Edit Conditions</button>

        <button onClick={lists.show}>Edit Lists</button>

        <button onClick={outputs.show}>Edit Outputs</button>

        <button onClick={fees.show}>Edit Fees</button>

        <button onClick={summaryBehaviour.show}>Edit summary behaviour</button>

        <button onClick={summary.show}>Summary</button>
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
      {formConfig.isVisible && (
        <Flyout title="Form Details" onHide={formConfig.hide}>
          <FormDetails data={data} onCreate={() => formConfig.hide} />
        </Flyout>
      )}
      {page && (
        <Flyout title="Add Page" onHide={page.hide}>
          <PageCreate data={data} onCreate={() => page.hide} />
        </Flyout>
      )}
      {link && (
        <Flyout title={i18n("menu.links")} onHide={link.hide}>
          <LinkCreate data={data} onCreate={() => link.hide} />
        </Flyout>
      )}
      {sections && (
        <Flyout title="Edit Sections" onHide={sections.hide}>
          <SectionsEdit data={data} onCreate={() => sections.hide} />
        </Flyout>
      )}
      {conditions && (
        <Flyout
          title={i18n("conditions.addOrEdit")}
          onHide={conditions.hide}
          width="large"
        >
          <ConditionsEdit data={data} onCreate={() => conditions.hide} />
        </Flyout>
      )}
      {lists && (
        <Flyout title="Edit Lists" onHide={lists.hide} width={""}>
          <ListsEditorContextProvider>
            <ListContextProvider>
              <ListsEdit />
            </ListContextProvider>
          </ListsEditorContextProvider>
        </Flyout>
      )}

      {fees && (
        <Flyout title="Edit Fees" onHide={fees.hide} width="xlarge">
          <FeeEdit data={data} onEdit={() => fees.hide} />
        </Flyout>
      )}
      {notify && (
        <Flyout title="Edit Notify" onHide={notify.hide} width="xlarge">
          <NotifyEdit data={data} onCreate={() => notify.hide} />
        </Flyout>
      )}
      {declaration && (
        <Flyout
          title="Edit Declaration"
          onHide={declaration.hide}
          width="xlarge"
        >
          <DeclarationEdit
            data={data}
            toggleShowState={this.toggleShowState}
            onCreate={() => declaration.hide}
          />
        </Flyout>
      )}
      {outputs && (
        <Flyout title="Edit Outputs" onHide={outputs.hide} width="xlarge">
          <OutputsEdit
            data={data}
            toggleShowState={this.toggleShowState}
            onCreate={() => outputs.hide}
          />
        </Flyout>
      )}
      {summaryBehaviour && (
        <Flyout
          title="Edit Summary behaviour"
          onHide={summaryBehaviour.hide}
          width="xlarge"
        >
          <DeclarationEdit
            data={data}
            toggleShowState={this.toggleShowState}
            onCreate={() => summaryBehaviour.hide}
          />
        </Flyout>
      )}
      {showSummary && (
        <Flyout title="Summary" width="large" onHide={showSummary.hide}>
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
