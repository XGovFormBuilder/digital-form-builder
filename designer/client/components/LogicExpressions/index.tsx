import React, { useContext, useState } from "react";
import { Select, Button, Input } from "@xgovformbuilder/govuk-react-jsx";
import { DataContext } from "../../context";
import { hasValidationErrors } from "../../validations";

export const LogicExpressionsEdit = () => {
  const { data, save } = useContext(DataContext);
  const [selectedExpression, setSelectedExpression] = useState();
  const [labelName, setLabelName] = useState<string>("");
  const [variableName, setVariableName] = useState<string>("");
  const onSave = () => {
    const dataCopy = { ...data };
    const logicExpressionObject = {
      label: labelName,
      variableName: variableName,
      expression: selectedExpression as any,
    };
    const validate = Boolean(
      labelName?.length === 0 ||
        variableName?.length === 0 ||
        !selectedExpression
    );
    if (hasValidationErrors(validate)) return;
    dataCopy?.logicExpressions?.push(logicExpressionObject);
    save(dataCopy);
  };

  const logicExpressions = [
    {
      children: "logic expression one",
      value: 1,
    },
    {
      children: "logic expression two",
      value: 2,
    },
    {
      children: "logic expression three",
      value: 3,
    },
  ];

  return (
    <>
      <Input
        label={{
          children: "Label",
        }}
        name="label-name"
        type="text"
        value={labelName}
        onChange={(e) => setLabelName(e.target.value)}
      />
      <Input
        label={{
          children: "Variable Name",
        }}
        name="variable-name"
        type="text"
        value={variableName}
        onChange={(e) => setVariableName(e.target.value)}
      />
      <Select
        id="select-1"
        items={logicExpressions}
        label={{
          children: "Label text goes here",
        }}
        name="select-1"
        value={selectedExpression}
        onChange={(e) => setSelectedExpression(e.target.value)}
      />
      <Button onClick={onSave}>save</Button>
    </>
  );
};
