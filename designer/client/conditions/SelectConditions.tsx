import React, { ChangeEvent } from "react";
import InlineConditions from "./InlineConditions";
import { ConditionsModel, Data } from "@xgovformbuilder/model";
import { Flyout } from "../components/Flyout";
import { Select } from "@govuk-jsx/select";
import { Hint } from "@govuk-jsx/hint";
import { i18n } from "../i18n";
import { DataContext } from "../context";
import { RenderInPortal } from "../components/RenderInPortal";

interface Props {
  path: string;
  data: Data;
  conditionsChange: (selectedCondition: string) => void;
  hints: any[];
  noFieldsHintText?: string;
}

interface State {
  inline: boolean;
  selectedCondition: string;
  fields: any;
}

class SelectConditions extends React.Component<Props, State> {
  static contextType = DataContext;

  constructor(props, context) {
    super(props, context);

    this.state = {
      fields: this.fieldsForPath(props.path),
      inline: false,
      selectedCondition: props.selectedCondition,
    };
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.path !== prevProps.path) {
      const fields = this.fieldsForPath(this.props.path);

      this.setState({
        conditions: new ConditionsModel(),
        fields: fields,
        editView: false,
      });
    }
  };

  fieldsForPath(path: string) {
    const { data } = this.context;
    const inputs = path ? data.inputsAccessibleAt(path) : data.allInputs ?? [];
    return inputs
      .map((input) => ({
        label: input.title,
        name: input.propertyPath,
        type: input.type,
      }))
      .reduce((obj, item) => {
        obj[item.name] = item;
        return obj;
      }, {});
  }

  onClickDefineCondition = (e) => {
    e.preventDefault();
    this.setState({
      inline: true,
    });
  };

  setState(state, callback?: () => void) {
    if (state.selectedCondition !== undefined) {
      this.props.conditionsChange(state.selectedCondition);
    }
    super.setState(state, callback);
  }

  onChangeConditionSelection = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    this.setState({
      selectedCondition: input.value,
    });
  };

  onCancelInlineCondition = () => {
    this.setState({
      inline: false,
    });
  };

  onSaveInlineCondition = (createdCondition) => {
    this.setState({
      inline: false,
      selectedCondition: createdCondition,
    });
  };

  render() {
    const { selectedCondition, inline } = this.state;
    const { hints = [], noFieldsHintText } = this.props;
    const { data } = this.context;
    const hasConditions = data.hasConditions || selectedCondition;
    const hasFields = Object.keys(this.state.fields ?? {}).length > 0;

    return (
      <div className="conditions" data-testid="select-conditions">
        <div className="govuk-form-group" id="conditions-header-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="page-conditions"
          >
            {i18n("conditions.optional")}
          </label>
          {hints.map((hint, index) => (
            <Hint key={`conditions-header-group-hint-${index}`}>{hint}</Hint>
          ))}
        </div>
        {hasFields || hasConditions ? (
          <div>
            {hasConditions && (
              <Select
                id="select-condition"
                name="cond-select"
                data-testid="select-condition"
                value={selectedCondition ?? ""}
                items={[
                  {
                    children: [""],
                    value: "",
                  },
                  ...this.context.data.conditions.map((it) => ({
                    children: [it.displayName],
                    value: it.name,
                  })),
                ]}
                label={{
                  className: "govuk-label--s",
                  children: ["Select a condition"],
                }}
                onChange={this.onChangeConditionSelection}
                required={false}
              />
            )}
            {!inline && (
              <div className="govuk-form-group">
                <a
                  href="#"
                  id="inline-conditions-link"
                  className="govuk-link"
                  onClick={this.onClickDefineCondition}
                >
                  Define a new condition
                </a>
              </div>
            )}
            {inline && (
              <RenderInPortal>
                <Flyout
                  title="Define condition"
                  onHide={this.onCancelInlineCondition}
                >
                  <InlineConditions
                    path={this.props.path}
                    conditionsChange={this.onSaveInlineCondition}
                    cancelCallback={this.onCancelInlineCondition}
                  />
                </Flyout>
              </RenderInPortal>
            )}
          </div>
        ) : (
          <div className="govuk-body">
            <div className="govuk-hint">{noFieldsHintText}</div>
          </div>
        )}
      </div>
    );
  }
}

export default SelectConditions;
