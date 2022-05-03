import React from "react";

type Props = {
  layout: any;
  data: any;
  scale?: number;
};

function onMapClick() {
  let test = "";
  window.scrollTo(500, 0);
}

export const Minimap = ({ layout, data, scale = 0.05 }: Props) => (
  <div className="minimap">
    <svg
      height={parseFloat(layout.height) * scale}
      width={parseFloat(layout.width) * scale}
    >
      {layout.edges.map((edge) => {
        const points = edge.points
          .map((points) => `${points.x * scale},${points.y * scale}`)
          .join(" ");
        return (
          <g key={points}>
            <polyline points={points} />
          </g>
        );
      })}

      {layout.nodes.map((node, index) => {
        return (
          <g key={node + index}>
            <a id={node + index} onClick={onMapClick}>
              <rect
                x={parseFloat(node.left) * scale}
                y={parseFloat(node.top) * scale}
                width={node.node.width * scale}
                height={node.node.height * scale}
                title={node.node.label}
              />
            </a>
          </g>
        );
      })}
    </svg>
  </div>
);
