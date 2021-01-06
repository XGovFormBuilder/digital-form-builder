import React from "react";
import { isInt } from "./inline-condition-helpers";

export interface HourMinute {
  hour: number;
  minute: number;
}

interface Props {
  hour?: number;
  minute?: number;
  updateValue: ({ hour, minute }: HourMinute) => void;
}

export const AbsoluteTimeValues = ({
  hour: initialHour,
  minute: initialMinute,
  updateValue,
}: Props) => {
  const [hour, setHour] = React.useState<string>(() =>
    initialHour ? initialHour.toString() : ""
  );
  const [minute, setMinute] = React.useState<string>(() =>
    initialMinute ? initialMinute.toString() : ""
  );

  React.useEffect(() => {
    if (
      isInt(hour) &&
      isInt(minute) &&
      (hour !== initialHour || minute !== initialMinute)
    ) {
      return updateValue({
        hour: parseInt(hour as string, 10),
        minute: parseInt(minute as string, 10),
      });
    }
  }, [hour, minute]);

  const hoursChanged = (e) => setHour(e.target.value);
  const minutesChanged = (e) => setMinute(e.target.value);

  return (
    <div className="govuk-date-input">
      <div className="govuk-date-input__item">
        <div className="govuk-form-group">
          <label
            htmlFor="cond-value-hours"
            className="govuk-label govuk-label--s"
          >
            HH
          </label>
          <input
            className="govuk-input govuk-input--width-2"
            id="cond-value-hours"
            name="cond-value-hours"
            type="number"
            maxLength={2}
            min={0}
            max={23}
            value={hour}
            required
            onChange={hoursChanged}
          />
        </div>
      </div>

      <div className="govuk-date-input__item">
        <div className="govuk-form-group">
          <label
            htmlFor="cond-value-minutes"
            className="govuk-label govuk-label--s"
          >
            mm
          </label>
          <input
            className="govuk-input govuk-input--width-2"
            id="cond-value-minutes"
            name="cond-value-minutes"
            type="number"
            maxLength={2}
            min={1}
            max={59}
            value={minute}
            required
            onChange={minutesChanged}
          />
        </div>
      </div>
    </div>
  );
};
