import React from "react";
import { AbsoluteDateValues, YearMonthDay } from "./AbsoluteDateValues";
import { AbsoluteTimeValues, HourMinute } from "./AbsoluteTimeValues";
import isValid from "date-fns/isValid";
import { i18n } from "../i18n";
import { isInt } from "./inline-condition-helpers";

interface Props {
  value?: Date;
  updateValue: (date) => void;
}

export const AbsoluteDateTimeValues = ({ value, updateValue }: Props) => {
  const [dateTimeParts, setDateTimeParts] = React.useState(() => {
    return {
      year: value && value.getFullYear(),
      month: value && value.getMonth() + 1,
      day: value && value.getDate(),
      hour: value && value.getHours(),
      minute: value && value.getMinutes(),
    };
  });

  const dateTimeChanged = (updated: YearMonthDay | HourMinute) => {
    const updatedDateTime = {
      ...dateTimeParts,
      ...updated,
    };
    setDateTimeParts(updatedDateTime);
    const { year, month, day, hour, minute } = updatedDateTime;
    if (year && month && day && isInt(hour) && isInt(minute)) {
      const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
      if (isValid(date)) {
        updateValue(date);
      }
    }
  };

  const { year, month, day, hour, minute } = dateTimeParts;
  return (
    <div>
      <AbsoluteDateValues
        year={year}
        month={month}
        day={day}
        updateValue={dateTimeChanged}
      />
      <AbsoluteTimeValues
        hour={hour}
        minute={minute}
        updateValue={dateTimeChanged}
      />
      <div>{i18n("enterDateTimeAsUtc")}</div>
    </div>
  );
};
