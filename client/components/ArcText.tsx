import React from "react";

const ArcText = ({ text, direction }: { text: string; direction: string }) => {
  const pathId = `arcPath-${direction}`;
  const isUpward = direction === "upward";

  // Define the SVG path for upward and downward arcs
  const dPath = isUpward
    ? "M10,150 A90,90 0 0,1 190,150" // Upward arc
    : "M10,50 A90,90 0 0,0 190,50"; // Downward arc

  return (
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <path id={pathId} fill="transparent" d={dPath} />
      </defs>
      <text>
        <textPath
          xlinkHref={`#${pathId}`}
          startOffset="50%"
          textAnchor="middle"
          style={{ fontSize: "14px" }}
        >
          {text}
        </textPath>
      </text>
    </svg>
  );
};

export default ArcText;
