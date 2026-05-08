import React from "react";

type Props = {
  fill?: string;
  className?: string;
};

const WishList3 = (props: Props) => {
  return (
    <>
      <svg
        width="15"
        height="12"
        viewBox="0 0 15 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M4.375 0.75C2.64937 0.75 1.25 2.04267 1.25 3.6375C1.25 4.92492 1.79687 7.98042 7.18 11.0692C7.27643 11.1239 7.38713 11.1529 7.5 11.1529C7.61287 11.1529 7.72357 11.1239 7.82 11.0692C13.2031 7.98042 13.75 4.92492 13.75 3.6375C13.75 2.04267 12.3506 0.75 10.625 0.75C8.89937 0.75 7.5 2.5 7.5 2.5C7.5 2.5 6.10062 0.75 4.375 0.75Z"
          stroke="#1E1E1E"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </>
  );
};

export default WishList3;
