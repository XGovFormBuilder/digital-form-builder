import React from "react";

type Props = {
  layout: any;
  scale?: number;
};

function onMapNodeClick(node, nodes) {
  resetClassName(nodes);
  window.scrollTo(
    node.node.x - node.node.width / 2,
    node.node.y - node.node.height / 2
  );
  let page = document.getElementById(node.node.label);
  page.setAttribute("class", "page page--selected");
}

// This is used for when a new node is slected the old node is no longer highlighted
function resetClassName(nodes) {
  nodes.map((node) => {
    let page = document.getElementById(node.node.label);
    page.setAttribute("class", "page");
  });
}

export const Minimap = ({ layout, scale = 0.05 }: Props) => (
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
          <g key={node.node.label + index}>
            <a
              id={node.node.label + index}
              data-testid={node.node.label + index}
              onClick={() => onMapNodeClick(node, layout.nodes)}
            >
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
