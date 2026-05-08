import React from "react";

const Cross = ({ ...props }) => {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M34 16.0143L31.9857 14L24 21.9857L16.0143 14L14 16.0143L21.9857 24L14 31.9857L16.0143 34L24 26.0143L31.9857 34L34 31.9857L26.0143 24L34 16.0143Z"
        fill="#E2E4E6"
      />
    </svg>
  );
};

export default Cross;
