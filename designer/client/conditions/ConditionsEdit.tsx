import React, { useContext, useState } from "react";
import InlineConditions from "./inline-conditions";
import { Flyout } from "./../components/Flyout";
import { DataContext } from "../context";
import { RenderInPortal } from "../components/RenderInPortal";
import { i18n } from "../i18n";

function useConditionsEditor() {
  const [editingCondition, setEditingCondition] = useState(null);
  const [showAddCondition, setShowAddCondition] = useState(false);

  function onClickCondition(e, condition) {
    e.preventDefault();
    setEditingCondition(condition);
  }
  function onClickAddCondition(e) {
    e.preventDefault();
    setShowAddCondition(true);
  }
  function editFinished(e) {
    e?.preventDefault();
    setEditingCondition(null);
    setShowAddCondition(false);
  }
  function cancelInlineCondition(e) {
    e?.preventDefault();
    setEditingCondition(null);
    setShowAddCondition(false);
  }

  return {
    editingCondition,
    showAddCondition,
    onClickCondition,
    onClickAddCondition,
    editFinished,
    cancelInlineCondition,
  };
}

export function ConditionsEdit() {
  const {
    editingCondition,
    showAddCondition,
    onClickCondition,
    onClickAddCondition,
    editFinished,
    cancelInlineCondition,
  } = useConditionsEditor();
  const { data } = useContext(DataContext);
  const { conditions } = data;
  return (
    <div className="govuk-body">
      {!editingCondition && (
        <>
          {showAddCondition && (
            <RenderInPortal>
              <Flyout
                title={i18n("conditions.add")}
                onHide={cancelInlineCondition}
              >
                <InlineConditions
                  data={data}
                  conditionsChange={cancelInlineCondition}
                  cancelCallback={cancelInlineCondition}
                />
              </Flyout>
            </RenderInPortal>
          )}

          <ul className="govuk-list">
            {conditions.map((condition) => (
              <li key={condition.name}>
                <a href="#" onClick={(e) => onClickCondition(e, condition)}>
                  {condition.displayName}
                </a>{" "}
                <small>{condition.name}</small>
                {"   ("}
                <small>{condition.expression}</small>
                {")"}
              </li>
            ))}
            <li>
              <hr />
              {data.allInputs().length > 0 && (
                <a
                  href="#"
                  id="add-condition-link"
                  onClick={onClickAddCondition}
                >
                  {i18n("conditions.add")}
                </a>
              )}
              {data.allInputs().length <= 0 && (
                <div className="govuk-body">
                  {i18n("conditions.noFieldsAvailable")}
                </div>
              )}
            </li>
          </ul>
        </>
      )}
      {editingCondition && (
        <RenderInPortal>
          <div id="edit-conditions" data-test-id="edit-conditions">
            <Flyout title={i18n("conditions.edit")} onHide={editFinished}>
              <InlineConditions
                data={data}
                condition={editingCondition}
                conditionsChange={editFinished}
                cancelCallback={editFinished}
              />
            </Flyout>
          </div>
        </RenderInPortal>
      )}
    </div>
  );
}

export default ConditionsEdit;
