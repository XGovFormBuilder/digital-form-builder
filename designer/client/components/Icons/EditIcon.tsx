import React from "react";

export function EditIcon({ bottom }) {
  return (
    <svg
      height="0.6em"
      width="1em"
      transform="scale(1.8)"
      style={bottom ? { verticalAlign: "bottom" } : {}}
    >
      <polyline
        points="1.5,9 9,1"
        style={{
          fill: "none",
          stroke: "grey",
          strokeWidth: "2",
          strokeLinecap: "butt",
        }}
      />
      <polyline
        points="9,1 9,1"
        style={{
          fill: "none",
          stroke: "grey",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
      />
      <line
        x1="1"
        x2="8.5"
        y1="9"
        y2="1"
        style={{ stroke: "gainsboro", strokeWidth: "0.1" }}
      />
      <line
        x1="1.5"
        x2="9"
        y1="9.5"
        y2="1.5"
        style={{ stroke: "gainsboro", strokeWidth: "0.1" }}
      />
      <line
        x1="8"
        x2="9.5"
        y1="0.6"
        y2="2"
        style={{ stroke: "gainsboro", strokeWidth: "0.7" }}
      />
      <ellipse
        cx="1.5"
        cy="9"
        rx="1"
        ry="0.5"
        transform="rotate(45, 1.5, 9)"
        style={{ fill: "gainsboro" }}
      />
      <polygon points="0,10.5 0.8,8.3 2.2,9.7" style={{ fill: "gainsboro" }} />
      <polygon points="0,10.5 0.3,9.7 0.9,10.2" style={{ fill: "grey" }} />
      Edit
    </svg>
  );
}
