import React from "react";

type Props = {
  fill?: string;
  className?: string;
};

const WishList2 = (props: Props) => {
  return (
    <>
      <svg
        viewBox="0 0 24 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M7 2C4.239 2 2 4.216 2 6.95C2 9.157 2.875 14.395 11.488 19.69C11.6423 19.7839 11.8194 19.8335 12 19.8335C12.1806 19.8335 12.3577 19.7839 12.512 19.69C21.125 14.395 22 9.157 22 6.95C22 4.216 19.761 2 17 2C14.239 2 12 5 12 5C12 5 9.761 2 7 2Z"
          stroke="#1E1E1E"
          stroke-width="2.1"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </>
  );
};

export default WishList2;
