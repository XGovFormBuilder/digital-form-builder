import React, { MouseEvent } from "react";
import { DataContext } from "../context";
import randomId from "../randomId";
import OutputEdit from "./output-edit";
import { Output } from "./types";

type Props = {};

type State = {
  showAddOutput: boolean;
  output?: any; //TODO: type
  id?: string;
};

class OutputsEdit extends React.Component<Props, State> {
  static contextType = DataContext;
  constructor(props) {
    super(props);
    this.state = {
      showAddOutput: false,
      output: undefined,
      id: "",
    };
  }

  onClickOutput = (event: MouseEvent, output) => {
    event.preventDefault();

    this.setState({
      output,
    });
  };

  onClickAddOutput = async (event: MouseEvent) => {
    event.preventDefault();

    const id = randomId();
    this.setState({
      showAddOutput: true,
      id,
    });
  };

  render() {
    const data = this.context.data;
    const { outputs } = data;
    const { output, id, showAddOutput } = this.state;

    return (
      <div className="govuk-body">
        {!output ? (
          <div>
            {showAddOutput ? (
              <OutputEdit
                data={data}
                output={{ name: id } as Output}
                onEdit={() => this.setState({ showAddOutput: false })}
                onCancel={() => this.setState({ showAddOutput: false })}
              />
            ) : (
              <ul className="govuk-list">
                {(outputs || []).map((output) => (
                  <li key={output.name}>
                    <a href="#" onClick={(e) => this.onClickOutput(e, output)}>
                      {output.title || output.name}
                    </a>
                  </li>
                ))}
                <li>
                  <hr />
                  <a
                    data-testid="add-output"
                    href="#"
                    onClick={this.onClickAddOutput}
                  >
                    Add output
                  </a>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <OutputEdit
            output={output}
            data={data}
            onEdit={() => this.setState({ output: null })}
            onCancel={() => this.setState({ output: null })}
          />
        )}
      </div>
    );
  }
}

export default OutputsEdit;
