import React from "react";

type Props = {
    fill?: string;
    className?: string;
  };

const WishListPdp = (props: Props) => {
  return (
    <>
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="21"
        viewBox="0 0 24 21"
      >
        <path
          d="M7 2.00146C4.239 2.00146 2 4.21746 2 6.95146C2 9.15846 2.875 14.3965 11.488 19.6915C11.6423 19.7853 11.8194 19.835 12 19.835C12.1806 19.835 12.3577 19.7853 12.512 19.6915C21.125 14.3965 22 9.15846 22 6.95146C22 4.21746 19.761 2.00146 17 2.00146C14.239 2.00146 12 5.00146 12 5.00146C12 5.00146 9.761 2.00146 7 2.00146Z"
          stroke="#1E1E1E"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};

export default WishListPdp;
