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
      year: value && value.getUTCFullYear(),
      month: value && value.getUTCMonth() + 1,
      day: value && value.getUTCDate(),
      hour: value && value.getUTCHours(),
      minute: value && value.getUTCMinutes(),
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
      const utcMilliseconds = Date.UTC(year, month - 1, day, hour, minute);
      const date = new Date(utcMilliseconds);
      if (isValid(date)) {
        updateValue(date);
      }
    }
  };

  const { year, month, day, hour, minute } = dateTimeParts;
  return (
    <div>
      <AbsoluteDateValues
        value={{ year, month, day }}
        updateValue={dateTimeChanged}
      />
      <AbsoluteTimeValues
        value={{ hour, minute }}
        updateValue={dateTimeChanged}
      />
      <div>{i18n("enterDateTimeAsGmt")}</div>
    </div>
  );
};
