import React from "react";
import isValid from "date-fns/isValid";
import { tryParseInt } from "./inline-condition-helpers";

export interface YearMonthDay {
  year: number;
  month: number;
  day: number;
}

interface Props {
  year?: number;
  month?: number;
  day?: number;
  updateValue: ({ year, month, day }: YearMonthDay) => void;
}

export const AbsoluteDateValues = ({
  year: initialYear,
  month: initialMonth,
  day: initialDay,
  updateValue,
}: Props) => {
  const [year, setYear] = React.useState(() => initialYear || "");
  const [month, setMonth] = React.useState(() => initialMonth || "");
  const [day, setDay] = React.useState(() => initialDay || "");

  React.useEffect(() => {
    if (
      year &&
      month &&
      day &&
      (year !== initialYear || month !== initialMonth || day !== initialDay) &&
      isValid(new Date(year, month - 1, day))
    ) {
      return updateValue({ year, month, day });
    }
  }, [year, month, day]);

  const yearChanged = (e) => setYear(tryParseInt(e.target.value));
  const monthChanged = (e) => setMonth(tryParseInt(e.target.value));
  const dayChanged = (e) => setDay(tryParseInt(e.target.value));

  return (
    <div className="govuk-date-input">
      <div className="govuk-date-input__item">
        <div className="govuk-form-group">
          <label
            htmlFor="cond-value-year"
            className="govuk-label govuk-label--s"
          >
            yyyy
          </label>
          <input
            className="govuk-input govuk-input--width-4"
            id="cond-value-year"
            name="cond-value-year"
            type="number"
            maxLength={4}
            minLength={4}
            value={year}
            required
            onChange={yearChanged}
          />
        </div>
      </div>

      <div className="govuk-date-input__item">
        <div className="govuk-form-group">
          <label
            htmlFor="cond-value-month"
            className="govuk-label govuk-label--s"
          >
            MM
          </label>
          <input
            className="govuk-input govuk-input--width-2"
            id="cond-value-month"
            name="cond-value-month"
            type="number"
            maxLength={2}
            min={1}
            max={12}
            value={month}
            required
            onChange={monthChanged}
          />
        </div>
      </div>
      <div className="govuk-date-input__item">
        <div className="govuk-form-group">
          <label
            htmlFor="cond-value-day"
            className="govuk-label govuk-label--s"
          >
            dd
          </label>
          <input
            className="govuk-input govuk-input--width-2"
            id="cond-value-day"
            name="cond-value-day"
            type="number"
            maxLength={2}
            min={1}
            max={31}
            value={day}
            required
            onChange={dayChanged}
          />
        </div>
      </div>
    </div>
  );
};
