import React, {
    Component,
    useRef,
    useState,
    useContext,
    useEffect,
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
  import { validateTitle, hasValidationErrors } from "./validations";
  import { DataContext } from "./context";
  
  import FeatureToggle from "./FeatureToggle";
  import { FeatureFlags } from "./context/FeatureFlagContext";
  import { findPage, updateLinksTo } from "./data";
  import logger from "./plugins/logger";
  import ComponentListSelect from "./components/ComponentListSelect/ComponentListSelect";
  import { boolean } from "joi";
  
  const PageEdit = (props) => {
    const { page, i18n } = props;
  
    const { data, save } = useContext(DataContext);
    const [path, setPath] = useState("");
    const [title, setTitle] = useState(page?.title ?? "");
    const [section, setSection] = useState(page?.section ?? "");
    const [controller, setController] = useState(page?.controller ?? "");
    const [isEditingSection, setIsEditingSection] = useState(false);
    const [isNewSection, setIsNewSection] = useState(false);
    const [isSummaryPage, setIsSummaryPage] = useState(false);
    const [errors, setErrors] = useState({});
    const formEditSection = useRef(0);
  
    const { sections } = data;
  
    useEffect(() => {
      setPath(page?.path ?? generatePath(page.title));
      setIsSummaryPage(title === "Summary");
    }, []);
  
    const onSubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new window.FormData(form);
  
      let validationErrors = validate(title, path);
      if (hasValidationErrors(validationErrors)) return;
  
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
  
      copy.declaration = formData.get("declaration") ?? "";
  
      copy.pages[copyIndex] = copyPage;
      try {
        await save(copy);
        props.closeFlyout();
      } catch (err) {
        logger.error("PageEdit", err);
      }
    };
  
    const validate = (title, path) => {
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
  
      setErrors(errors);
  
      return errors;
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
  
    return (
      <div data-testid="page-edit">
        {Object.keys(errors).length > 0 && (
          <ErrorSummary errorList={Object.values(errors)} />
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