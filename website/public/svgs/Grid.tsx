import React from "react";

const Grid = ({ ...props }) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {Array.from({ length: props.count }).map((_, index) => (
        <path
          key={index}
          //   d="M1 13L0.999999 1"
          d={`M${1 + index * 5} 13L${1 + index * 5} 1`}
          stroke-width="2"
          stroke-miterlimit="10"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      ))}
    </svg>
  );
};

export default Grid;
