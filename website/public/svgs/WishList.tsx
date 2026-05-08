import React from "react";

type Props = {
  fill?: string;
  className?: string;
};

const WishList = (props: Props) => {
  return (
    <>
      {/* <svg
        {...props}
        width="22"
        height="20"
        viewBox="0 0 22 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.5 2C4.0151 2 2 3.98817 2 6.44107C2 8.42116 2.7875 13.1206 10.5392 17.8712C10.6781 17.9555 10.8375 18 11 18C11.1625 18 11.3219 17.9555 11.4608 17.8712C19.2125 13.1206 20 8.42116 20 6.44107C20 3.98817 17.9849 2 15.5 2C13.0151 2 11 4.69156 11 4.69156C11 4.69156 8.9849 2 6.5 2Z"
          stroke="#1E1E1E"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg> */}
      <svg {...props} width="22" height="20" viewBox="0 0 22 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.62 18.81C11.28 18.93 10.72 18.93 10.38 18.81C7.48 17.82 1 13.69 1 6.68998C1 3.59998 3.49 1.09998 6.56 1.09998C8.38 1.09998 9.99 1.97998 11 3.33998C12.01 1.97998 13.63 1.09998 15.44 1.09998C18.51 1.09998 21 3.59998 21 6.68998C21 13.69 14.52 17.82 11.62 18.81Z" stroke="#292D32" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>

    </>
  );
};

export default WishList;
