import React from "react";
import isValid from "date-fns/isValid";
import { isInt, tryParseInt } from "./inline-condition-helpers";

export interface YearMonthDay {
  year: number;
  month: number;
  day: number;
}

export interface YearMonthDayOptional {
  year?: number;
  month?: number;
  day?: number;
}

interface Props {
  value?: YearMonthDayOptional;
  updateValue: ({ year, month, day }: YearMonthDay) => void;
}

export const AbsoluteDateValues = ({ value = {}, updateValue }: Props) => {
  const [year, setYear] = React.useState<string>(() =>
    isInt(value.year) ? (value.year as number).toString() : ""
  );
  const [month, setMonth] = React.useState<string>(() =>
    isInt(value.month) ? (value.month as number).toString() : ""
  );
  const [day, setDay] = React.useState<string>(() =>
    isInt(value.day) ? (value.day as number).toString() : ""
  );

  React.useEffect(() => {
    const parsedYear = tryParseInt(year);
    const parsedMonth = tryParseInt(month);
    const parsedDay = tryParseInt(day);
    if (
      parsedYear &&
      parsedMonth &&
      parsedDay &&
      (parsedYear !== value.year ||
        parsedMonth !== value.month ||
        parsedDay !== value.day) &&
      isValid(new Date(parsedYear, parsedMonth - 1, parsedDay))
    ) {
      updateValue({ year: parsedYear, month: parsedMonth, day: parsedDay });
    }
  }, [year, month, day]);

  const yearChanged = (e) => setYear(e.target.value);
  const monthChanged = (e) => setMonth(e.target.value);
  const dayChanged = (e) => setDay(e.target.value);

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
