import React, {
  Component,
  useRef,
  useState,
  useContext,
  useEffect,
  useLayoutEffect
} from "react";
import { Input } from "@govuk-jsx/input";
import Editor from "./editor";
import { clone } from "@xgovformbuilder/model";
import randomId from "./randomId";

import { toUrl } from "./helpers";
import { RenderInPortal } from "./components/RenderInPortal";
import SectionEdit from "./section/section-edit";
import { Flyout } from "./components/Flyout";
import { withI18n } from "./i18n";
import ErrorSummary from "./error-summary";
import { validateTitle, hasValidationErrors, hasRepeatingFieldErrors, validateRows } from "./validations";
import { DataContext } from "./context";
import { ComponentContext } from "./reducers/component/componentReducer";
import { RepeatingFields } from "./reducers/component/types";
import FeatureToggle from "./FeatureToggle";
import { FeatureFlags } from "./context/FeatureFlagContext";
import { findPage, updateLinksTo } from "./data";
import logger from "./plugins/logger";

import ComponentListSelect from "./components/ComponentListSelect/ComponentListSelect";
import { boolean } from "joi";
import "./components/FieldEditors/FieldEditor.scss";
import { errorMonitor } from "events";

const PageEdit = (props) => {
  const { page, i18n, value } = props;
  const { data, save } = useContext(DataContext);
  const { state, dispatch } = useContext(ComponentContext)
  const { selectedComponent } = state;
  const { items } = selectedComponent;

  const [path, setPath] = useState("");
  const [title, setTitle] = useState(page?.title ?? "");
  const [section, setSection] = useState(page?.section ?? "");
  const [controller, setController] = useState(page?.controller ?? "");
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [isNewSection, setIsNewSection] = useState(false);
  const [isSummaryPage, setIsSummaryPage] = useState(false);
  const [errors, setErrors] = useState({});
  const [repeatingFieldErrors, setRepeatingFieldErrors] = useState([]);
  const formEditSection = useRef(0);

  const [showSectionBreak, setShowSectionBreak] = useState(true);
  const [editRow, setEditRow] = useState(false);
  const [deleteRow, setDeleteRow] = useState(false);
  const [rows, setRows] = useState<JSX.Element[]>([]);
  const [key, setKey] = useState(0);
  const [temp, setTemp] = useState({});

  //const [errors, setTemp] = useState({});

  const [isValidate, setValidate] = useState(false);
  const { sections } = data;

  useEffect(() => {
    setPath(page?.path ?? generatePath(page.title));
    setIsSummaryPage(title === "Summary");
  }, []);

  useEffect(() => {
    if (editRow) {
      const items = selectedComponent.items ?? [];

      const id = temp.id;
      const name = temp.name;

      const title = items[id].title ?? "";
      const value = items[id].value ?? "";

      const rowData = {};

      if (name === "title") {
        rowData.title = temp.value;
        rowData.value = value;
      }
      else {
        rowData.title = title;
        rowData.value = temp.value;
      }

      items[id] = rowData;

      dispatch({
        type: RepeatingFields.EDIT_ROW,
        payload: items
      })

      setEditRow(false);
    }
  }, [editRow]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new window.FormData(form);

    let validationErrors = validate(title, path);

    if (hasValidationErrors(validationErrors[0]) ||
      hasRepeatingFieldErrors(validationErrors[1])) return;

    let copy = { ...data };
    const [copyPage, copyIndex] = findPage(data, page.path);
    const pathChanged = path !== page.path;

    if (pathChanged) {
      copy = updateLinksTo(data, page.path, path);
      copyPage.path = path;
      if (copyIndex === 0) {
        copy.startPage = path;
      }
    }

    copyPage.title = title;
    section ? (copyPage.section = section) : delete copyPage.section;
    controller
      ? (copyPage.controller = controller)
      : delete copyPage.controller;

    console.log('saved?');

    copy.declaration = formData.get("declaration") ?? "";

    const { items } = selectedComponent;
    copyPage.repeatingField = items;

    copy.pages[copyIndex] = copyPage;

    try {
      await save(copy);
      props.onEdit();
    } catch (err) {
      logger.error("PageEdit", err);
      console.log("Error ");
      console.log(err);
    }
  };

  const validate = (title, path) => {
    const repeatingFieldErrors = validateRows(items, i18n);
    const titleErrors = validateTitle("page-title", title, i18n);
    const errors = { ...titleErrors };

    let pathHasErrors;
    if (path !== page.path)
      pathHasErrors = data.pages.find((page) => page.path === path);
    if (pathHasErrors) {
      errors.path = {
        href: "#page-path",
        children: `Path '${path}' already exists`,
      };
    }

    setRepeatingFieldErrors(repeatingFieldErrors);
    setErrors(errors); // append to here (fix for red outliners)
    return [errors, repeatingFieldErrors];
  };

  const onClickDelete = async (e) => {
    e.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    const copy = clone(data);
    const copyPageIdx = copy.pages.findIndex((p) => p.path === page.path);

    // Remove all links to the page
    copy.pages.forEach((p, index) => {
      if (index !== copyPageIdx && Array.isArray(p.next)) {
        for (let i = p.next.length - 1; i >= 0; i--) {
          const next = p.next[i];
          if (next.path === page.path) {
            p.next.splice(i, 1);
          }
        }
      }
    });

    copy.pages.splice(copyPageIdx, 1);
    try {
      await save(copy);
    } catch (error) {
      logger.error("PageEdit", error);
    }
  };

  const onClickDuplicate = async (e) => {
    e.preventDefault();
    const copy = clone(data);
    const duplicatedPage = clone(page);
    duplicatedPage.path = `${duplicatedPage.path}-${randomId()}`;
    duplicatedPage.components.forEach((component) => {
      component.name = `${duplicatedPage.path}-${randomId()}`;
    });
    copy.pages.push(duplicatedPage);
    try {
      await save(copy);
    } catch (err) {
      logger.error("PageEdit", err);
    }
  };

  const onChangeTitle = (e) => {
    const title = e.target.value;
    setTitle(title);
    setPath(generatePath(title));
  };

  const onChangePath = (e) => {
    const input = e.target.value;
    const path = input.startsWith("/") ? input : `/${input}`;
    setPath(path.replace(/\s/g, "-"));
  };

  const generatePath = (title) => {
    let path = toUrl(title);
    if (data.pages.find((page) => page.path === path) && page.title !== title) {
      path = `${path}-${randomId()}`;
    }
    return path;
  };

  const editSection = (e, newSection = false) => {
    e.preventDefault();

    setIsEditingSection(true);
    setIsNewSection(newSection);
  };

  const closeFlyout = (sectionName) => {
    const propSection = section ?? props.page?.section ?? "";
    setIsEditingSection(false);
    setSection(sectionName);
  };

  const onChangeSection = (e) => {
    setSection(e.target.value);
  };

  const findSectionWithName = (name) => {
    return sections.find((section) => section.name === name);
  };

  const onCreate = () => {
    const _rows = rows;

    const items = selectedComponent.items ?? [];

    _rows.push(row());
    setRows(_rows);

    const temp = {};
    temp.title = "";
    temp.value = "";

    items[key] = temp;

    dispatch({
      type: RepeatingFields.ADD_ROW,
      payload: items
    });
    setKey(key + 1);

  }

  const onDelete = (e) => {
    e?.preventDefault();
    const _rows = rows;

    if (_rows.length === 0) {
      setKey(0);
      return;
    }

    const items = selectedComponent.items;
    _rows.pop();
    setRows(_rows);

    items.pop();

    dispatch({
      type: RepeatingFields.DELETE_ROW,
      payload: items
    })

    setKey(key - 1);
  }

  const editData = (e) => {
    const temp = {};

    let id = e.target.id;
    const key = id.charAt(id.length - 1);

    temp.id = key;
    temp.title = e.target.title;
    temp.name = e.target.name;
    temp.value = e.target.value;

    setTemp(temp);
    setEditRow(true);
  }

  const row = () => {
    return (<div className="multiInputField__field" key={key}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Input
            name="title"
            id={"page-title-".concat(key.toString())}
            className="govuk-input--width-10"
            onChange={(e) =>
              editData(e)
            }
            /* hint={{
               children: [i18n("common.titleField.helpText")],
             }} */
            label={{
              children: [i18n("common.titleField.title")],
            }}
            errorMessage={
              repeatingFieldErrors[key]?.title ?
                { children: repeatingFieldErrors[key]?.title.children } : undefined
            }

            type="text"
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Input
            name="value"
            id={"page-value-".concat(key.toString())}
            className="govuk-input--width-10"
            onChange={(e) =>
              editData(e)
            }
            /* hint={{
               children: [i18n("common.titleField.helpText")],
             }}*/
            label={{
              children: [i18n("list.item.value")],
            }}
            type="text"
            errorMessage={
              repeatingFieldErrors.indexOf(key).value ?
                { children: repeatingFieldErrors.indexOf(key)?.value.children } : undefined
            }
          />
        </div>
        {showSectionBreak &&
          (<hr className="multiInputField__section_break govuk-section- break govuk-section-break--m govuk-section-break--visible " />)
        }
      </div>
    </div>)
  }

  const fieldRows = () => { return Object.values(rows) };

  return (
    <div data-testid="page-edit">
      {(Object.keys(errors).length > 0 ||
        Object.keys(repeatingFieldErrors).length > 0) && (
          <ErrorSummary errorList={Object.values(errors)}
            repeatingErrorList={Object.values(repeatingFieldErrors)} />
        )}
      <form onSubmit={onSubmit} autoComplete="off">
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="page-type">
            {i18n("page.type")}
          </label>
          <select
            className="govuk-select"
            id="page-type"
            name="page-type"
            value={controller}
            onChange={(e) => setController(e.target.value)}
          >
            <option value="">{i18n("page.types.question")}</option>
            <option value="./pages/start.js">{i18n("page.types.start")}</option>
            <option value="./pages/summary.js">
              {i18n("page.types.summary")}
            </option>
          </select>
        </div>
        <Input
          id="page-title"
          name="title"
          label={{
            className: "govuk-label--s",
            children: [i18n("page.title")],
          }}
          value={title}
          onChange={onChangeTitle}
          errorMessage={
            errors?.title ? { children: errors?.title.children } : undefined
          }
        />
        <Input
          id="page-path"
          name="path"
          label={{
            className: "govuk-label--s",
            children: [i18n("page.path")],
          }}
          hint={{
            children: [i18n("page.pathHint")],
          }}
          value={path}
          onChange={onChangePath}
          errorMessage={
            errors?.path ? { children: errors.path?.children } : undefined
          }
        />
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="page-section">
            {i18n("page.section")}
          </label>
          <span className="govuk-hint">{i18n("page.sectionHint")}</span>
          {sections.length > 0 && (
            <select
              className="govuk-select"
              id="page-section"
              name="section"
              value={section}
              onChange={onChangeSection}
            >
              <option />
              {sections.map((section) => (
                <option key={section.name} value={section.name}>
                  {section.title}
                </option>
              ))}
            </select>
          )}
          {section && (
            <a
              href="#"
              className="govuk-link govuk-!-display-block"
              onClick={editSection}
            >
              {i18n("section.edit")}
            </a>
          )}
          {!section && (
            <a
              href="#"
              className="govuk-link govuk-!-display-block"
              onClick={(e) => editSection(e, true)}
            >
              {i18n("section.create")}
            </a>
          )}
        </div>
        {isSummaryPage && (
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="declaration">
              Declaration
            </label>
            <span className="govuk-hint">
              The declaration can include HTML and the `govuk-prose-scope` css
              class is available. Use this on a wrapping element to apply
              default govuk styles.
            </span>
            <Editor name="declaration" />
          </div>
        )}
        <div className="multiInputField">
          {fieldRows()}

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <div className="govuk-button govuk-button--secondary"
                onClick={onCreate}
              >
                Add Row
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <a href="#" className="multiInputField__delete govuk-link"
                onClick={onDelete}>
                Delete
              </a>
            </div>
          </div>
          <div className="govuk-!-padding-bottom-4" />
        </div>

        <button className="govuk-button" type="submit">
          {i18n("save")}
        </button>{" "}
        <FeatureToggle
          feature={FeatureFlags.FEATURE_EDIT_PAGE_DUPLICATE_BUTTON}
        >
          <button
            className="govuk-button"
            type="button"
            onClick={onClickDuplicate}
          >
            {i18n("duplicate")}
          </button>{" "}
        </FeatureToggle>
        <button className="govuk-button" type="button" onClick={onClickDelete}>
          {i18n("delete")}
        </button>
      </form>
      {isEditingSection && (
        <RenderInPortal>
          <Flyout
            title={
              section?.name
                ? i18n("section.editingTitle", { title: section.title })
                : i18n("section.newTitle")
            }
            onHide={closeFlyout}
            show={isEditingSection}
          >
            <SectionEdit
              section={isNewSection ? {} : findSectionWithName(section)}
              data={data}
              closeFlyout={closeFlyout}
            />
          </Flyout>
        </RenderInPortal>
      )}
    </div>
  );
};

export default withI18n(PageEdit);
