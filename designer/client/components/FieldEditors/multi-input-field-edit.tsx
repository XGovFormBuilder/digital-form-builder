import React, { useState, useEffect, useLayoutEffect, useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Input } from "@govuk-jsx/input";
import { Button } from "@govuk-jsx/button";
import { i18n } from "../../i18n/";
import { Actions } from "../../reducers/component/types";
import "./FieldEditor.scss";
import { cloneWithShallow } from "hoek";
type Props = {
  context: any; // TODO

};

export const MultiInputField = ({ context = ComponentContext }) => {
  const { state, dispatch } = useContext(context);
  const { selectedComponent } = state;
  const { options = {} } = selectedComponent;

  const [showSectionBreak, setShowSectionBreak] = useState(true);
  const [addRow, setAddRow] = useState(false);
  const [deleteRow, setDeleteRow] = useState(false);
  const [rows, setRows] = useState<JSX.Element[]>([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (addRow) {
      setAddRow(false);
    }

    if (deleteRow && (rows.length >= 0)) {
      setCounter(counter - 1);
      setDeleteRow(false);
    }

  }, [addRow, deleteRow]);

  const onCreate = () => {
    const _rows = rows;
    setAddRow(true);
    setCounter(counter + 1);

    dispatch({
      type: Actions.EDIT_OPTIONS_ADD_ROW,
      payload: true
    })

    _rows.push(row());

    setRows(_rows);
  }

  const onDelete = (e) => {
    e?.preventDefault();
    const _rows = rows;
    setDeleteRow(true);
    

    dispatch({
      type: Actions.EDIT_OPTIONS_ADD_ROW,
      payload: false
    })

    _rows.pop();
    setRows(_rows);
  }

  const row = () => {
    console.log("leader " + counter);
    return (<div className="multiInputField__field" key={counter}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Input
            className="govuk-input--width-10"
            /* hint={{
               children: [i18n("common.titleField.helpText")],
             }} */
            id="input-width-10"
            label={{
              children: [i18n("common.titleField.title")],
            }}
            name="test-width-10"
            type="text"
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Input
            className="govuk-input--width-10"
            /* hint={{
               children: [i18n("common.titleField.helpText")],
             }}*/
            id="input-width-10"
            label={{
              children: [i18n("common.titleField.title")],
            }}
            name="test-width-10"
            type="text"
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
        <div className="govuk-!-padding-bottom-4"/>
    </div>
  );
};

