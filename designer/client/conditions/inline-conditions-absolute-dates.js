import React from "react";
import { ConditionValue } from "@xgovformbuilder/model";
import momentTz from "moment-timezone";

export class AbsoluteTimeValues extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hours: props.value?.value.split(":")[0],
      minutes: props.value?.value.split(":")[1],
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { hours, minutes } = this.state;
    const everythingComplete = hours && minutes;
    const hasChanged =
      hours !== prevState.hours || minutes !== prevState.minutes;
    if (everythingComplete && hasChanged) {
      this.props.updateValue(new ConditionValue(`${hours}:${minutes}`));
    }
  }

  render() {
    const { hours, minutes } = this.state;

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
              defaultValue={hours}
              required
              onChange={(e) =>
                this.setState({ hours: e.target.value.padStart(2, "0") })
              }
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
              defaultValue={minutes}
              required
              onChange={(e) =>
                this.setState({ minutes: e.target.value.padStart(2, "0") })
              }
            />
          </div>
        </div>
      </div>
    );
  }
}

export class AbsoluteDateValues extends React.Component {
  constructor(props) {
    super(props);
    if (props.value) {
      const dateComponents = props.value.value.split("-");
      this.state = {
        year: dateComponents[0],
        month: dateComponents[1],
        day: dateComponents[2],
      };
    } else {
      this.state = {};
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { year, month, day } = this.state;
    const everythingComplete = year && month && day;
    const hasChanged =
      year !== prevState.year ||
      month !== prevState.month ||
      day !== prevState.day;
    if (everythingComplete && hasChanged) {
      this.props.updateValue(new ConditionValue(`${year}-${month}-${day}`));
    }
  }

  render() {
    const { year, month, day } = this.state;

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
              defaultValue={year}
              required
              onChange={(e) => this.setState({ year: e.target.value })}
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
              defaultValue={month}
              required
              onChange={(e) =>
                this.setState({ month: e.target.value.padStart(2, "0") })
              }
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
              defaultValue={day}
              required
              onChange={(e) =>
                this.setState({ day: e.target.value.padStart(2, "0") })
              }
            />
          </div>
        </div>
      </div>
    );
  }
}

export class AbsoluteDateTimeValues extends React.Component {
  constructor(props) {
    super(props);
    const defaultTimeZone = "Europe/London";
    if (props.value) {
      const parsed = momentTz.tz(props.value.value, defaultTimeZone);

      this.state = {
        date: new ConditionValue(parsed.format("YYYY-MM-DD")),
        // throw away any second / millis values
        time: new ConditionValue(parsed.format("HH:mm")),
        timeZone: defaultTimeZone,
      };
    } else {
      this.state = {
        timeZone: defaultTimeZone,
      };
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { date, time, timeZone } = this.state;
    const everythingComplete = date && time && timeZone;
    const hasChanged =
      date !== prevState.date ||
      time !== prevState.time ||
      timeZone !== prevState.timeZone;
    if (everythingComplete && hasChanged) {
      this.props.updateValue(
        new ConditionValue(
          momentTz.tz(`${date.value} ${time.value}`, timeZone).toISOString()
        )
      );
    }
  }

  render() {
    const { date, time, timeZone } = this.state;
    return (
      <div>
        <AbsoluteDateValues
          value={date}
          updateValue={(dateValue) => this.setState({ date: dateValue })}
        />
        <AbsoluteTimeValues
          value={time}
          updateValue={(timeValue) => this.setState({ time: timeValue })}
        />
        <select
          className="govuk-select"
          id="cond-value-tz"
          name="cond-value-tz"
          value={timeZone}
          onChange={(e) => this.setState({ timeZone: e.target.value })}
        >
          {momentTz.tz.names().map((tz) => {
            return (
              <option key={tz} value={tz}>
                {tz}
              </option>
            );
          })}
        </select>
      </div>
    );
  }
}
