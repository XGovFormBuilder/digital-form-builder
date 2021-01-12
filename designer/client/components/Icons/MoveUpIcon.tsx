import React from "react";

export function MoveUpIcon() {
  return (
    <svg height="0.6em" width="1.5em">
      <polyline
        points="1,9 10,2 19,9"
        style={{
          fill: "none",
          stroke: "grey",
          strokeWidth: 4,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
      />
      Move up
    </svg>
  );
}
