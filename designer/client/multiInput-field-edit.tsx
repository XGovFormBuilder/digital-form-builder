import React, { useContext } from "react";
import { ComponentContext } from "./reducers/component/componentReducer";
import { Actions } from "./reducers/component/types";

import { TextFieldEdit } from "./components/FieldEditors/text-field-edit";

const MultiInputField = ({ context = ComponentContext }) => {
  const { state, dispatch } = useContext(context);
  const { selectedComponent } = state;
  const { options = {} } = selectedComponent;

  return (
      <p>who</p>

      


  
  );
};
