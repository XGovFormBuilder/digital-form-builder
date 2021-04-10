import React from "react";
import { Data } from "@xgovformbuilder/model";

import { Flyout } from "../Flyout";
import LinkEdit from "../../link-edit";
import { Layout, Edge } from "./getLayout";

type Props = {
  layout: Layout["pos"];
  data: Data;
  persona: any;
};

type State = {
  showEditor: Edge | boolean;
};

export class Lines extends React.Component<Props, State> {
  state = {
    showEditor: false,
  };

  editLink = (edge: Edge) => {
    this.setState({
      showEditor: edge,
    });
  };

  render() {
    const { layout, data, persona } = this.props;

    return (
      <div>
        <svg height={layout.height} width={layout.width}>
          {layout.edges.map((edge) => {
            const points = edge.points
              .map((points) => `${points.x},${points.y}`)
              .join(" ");

            const xs = edge.points.map((p) => p.x);
            const ys = edge.points.map((p) => p.y);

            const textX = xs.reduce((a, b) => a + b, 0) / xs.length;
            const textY = ys.reduce((a, b) => a + b, 0) / ys.length - 5;
            const highlight = [edge.source, edge.target].every((path) =>
              persona?.paths?.includes(path)
            );
            return (
              <g key={points}>
                <polyline
                  onClick={() => this.editLink(edge)}
                  points={points}
                  className={`${highlight ? "highlight" : ""}`}
                />
                {edge.label && (
                  <text
                    textAnchor="middle"
                    x={textX}
                    y={textY}
                    fill="black"
                    pointerEvents="none"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {this.state.showEditor && (
          <Flyout
            title="Edit Link"
            onHide={() => this.setState({ showEditor: false })}
          >
            <LinkEdit
              edge={this.state.showEditor}
              data={data}
              onEdit={() => this.setState({ showEditor: false })}
            />
          </Flyout>
        )}
      </div>
    );
  }
}
