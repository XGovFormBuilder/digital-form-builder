import React, { ChangeEvent } from "react";
import { ComponentTypes } from "@xgovformbuilder/model";

console.log("XXXXX", ComponentTypes);

type Props = {
  onChangeComponentType: (event: ChangeEvent<HTMLSelectElement>) => void;
};

export const ComponentCreateList = ({ onChangeComponentType }: Props) => (
  <div className="govuk-form-group">
    <label className="govuk-label govuk-label--s" htmlFor="type">
      Type
    </label>
    <select
      className="govuk-select"
      id="type"
      name="type"
      required
      onChange={onChangeComponentType}
    >
      <option />
      {ComponentTypes.sort((a, b) =>
        (a.title ?? "").localeCompare(b.title)
      ).map((type) => {
        return (
          <option key={type.name} value={type.name}>
            {type.title}
          </option>
        );
      })}
    </select>
  </div>
);
