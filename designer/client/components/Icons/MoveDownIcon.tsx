import React from "react";

export function MoveDownIcon() {
  return (
    <svg height="0.6em" width="1.5em">
      <polyline
        points="1,1 10,9 19,1"
        style={{
          fill: "none",
          stroke: "grey",
          strokeWidth: 4,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
      />
      Move down
    </svg>
  );
}
