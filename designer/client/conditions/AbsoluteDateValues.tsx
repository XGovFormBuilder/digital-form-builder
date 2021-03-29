import React, { useEffect, useState, ChangeEvent } from "react";
import isValid from "date-fns/isValid";
import padStart from "lodash/padStart";
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

function isValidateDate(props: {
  year?: number | string;
  month?: number | string;
  day?: number | string;
}) {
  const { year = 2020, month = 12, day = 1 } = props;
  const parsedDate = Date.parse(`${year}-${month}-${day}`);

  if (isNaN(parsedDate)) {
    return false;
  }

  return true;
}

function isValidDay(day: string) {
  return isValidateDate({ day });
}
function isValidMonth(month: string) {
  return isValidateDate({ month });
}
function isValidYear(year: string) {
  return year.length === 4 && isValidateDate({ year });
}

export const AbsoluteDateValues = ({ value = {}, updateValue }: Props) => {
  const [year, setYear] = useState<string>(() =>
    isInt(value.year) ? (value.year as number).toString() : ""
  );

  const [month, setMonth] = useState<string>(() =>
    isInt(value.month) ? padStart(String(value.month), 2, "0") : ""
  );

  const [day, setDay] = useState<string>(() =>
    isInt(value.day) ? padStart(String(value.day), 2, "0") : ""
  );

  useEffect(() => {
    const parsedDay = tryParseInt(day)!;
    const parsedMonth = tryParseInt(month)!;
    const parsedYear = tryParseInt(year)!;

    if (
      parsedDay === value.day &&
      parsedMonth === value.month &&
      parsedYear === value.year
    ) {
      return;
    }

    if (!isValidDay(day) || !isValidMonth(month) || !isValidYear(year)) {
      return;
    }

    if (isValid(new Date(parsedYear, parsedMonth - 1, parsedDay))) {
      updateValue({ year: parsedYear, month: parsedMonth, day: parsedDay });
    }
  }, [year, month, day]);

  const dayChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const day = e.target.value;
    if (Number(day) <= 31) {
      setDay(day);
    }
  };

  const monthChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const month = e.target.value;
    if (Number(month) <= 12) {
      setMonth(month);
    }
  };

  const yearChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const year = e.target.value;
    setYear(year);
  };

  return (
    <div className="govuk-date-input">
      <div className="govuk-date-input__item">
        <div className="govuk-form-group">
          <label
            htmlFor="cond-value-day"
            className="govuk-label govuk-label--s"
          >
            Day
          </label>
          <input
            className="govuk-input govuk-input--width-2"
            id="cond-value-day"
            name="cond-value-day"
            type="number"
            maxLength={2}
            minLength={2}
            min={1}
            max={31}
            value={day}
            required
            onChange={dayChanged}
          />
        </div>
      </div>
      <div className="govuk-date-input__item">
        <div className="govuk-form-group">
          <label
            htmlFor="cond-value-month"
            className="govuk-label govuk-label--s"
          >
            Month
          </label>
          <input
            className="govuk-input govuk-input--width-2"
            id="cond-value-month"
            name="cond-value-month"
            type="number"
            maxLength={2}
            minLength={2}
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
            htmlFor="cond-value-year"
            className="govuk-label govuk-label--s"
          >
            Year
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
    </div>
  );
};
