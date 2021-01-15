import React from "react";
import { DateDirections, RelativeTimeValue } from "@xgovformbuilder/model";

class RelativeTimeValues extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timePeriod: props.value?.timePeriod,
      timeUnits: props.value?.timeUnit,
      direction: props.value?.direction,
    };
  }

  updateState(state) {
    this.setState(state, () => {
      this.passValueToParentComponentIfComplete();
    });
  }

  passValueToParentComponentIfComplete() {
    const { timePeriod, timeUnits, direction } = this.state;
    if (timePeriod && timeUnits && direction) {
      this.props.updateValue(
        new RelativeTimeValue(
          timePeriod,
          timeUnits,
          direction,
          this.props.timeOnly || false
        )
      );
    }
  }

  render() {
    const { timePeriod, timeUnits, direction } = this.state;

    return (
      <div>
        <input
          className="govuk-input govuk-input--width-20"
          id="cond-value-period"
          name="cond-value-period"
          type="text"
          defaultValue={timePeriod}
          required
          onChange={(e) => this.updateState({ timePeriod: e.target.value })}
          data-testid="cond-value-period"
        />

        <select
          className="govuk-select"
          id="cond-value-units"
          name="cond-value-units"
          value={timeUnits ?? ""}
          onChange={(e) => this.updateState({ timeUnits: e.target.value })}
          data-testid="cond-value-units"
        >
          <option />
          {Object.values(this.props.units).map((unit) => {
            return (
              <option key={unit.value} value={unit.value}>
                {unit.display}
              </option>
            );
          })}
        </select>

        <select
          className="govuk-select"
          id="cond-value-direction"
          name="cond-value-direction"
          value={direction ?? ""}
          onChange={(e) => this.updateState({ direction: e.target.value })}
          data-testid="cond-value-direction"
        >
          <option />
          {Object.values(DateDirections).map((direction) => {
            return (
              <option key={direction} value={direction}>
                {direction}
              </option>
            );
          })}
        </select>
      </div>
    );
  }
}
export default RelativeTimeValues;
