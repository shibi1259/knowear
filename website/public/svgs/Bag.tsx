import React from "react";

type Props = {
  fill?: string;
  className?: string;
  stroke?: string;
};

const Bag = (props: Props) => {
  return (
    <>
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
<path d="M8.93738 17.875C9.31707 17.875 9.62488 17.5672 9.62488 17.1875C9.62488 16.8078 9.31707 16.5 8.93738 16.5C8.55768 16.5 8.24988 16.8078 8.24988 17.1875C8.24988 17.5672 8.55768 17.875 8.93738 17.875Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M17.1874 17.875C17.5671 17.875 17.8749 17.5672 17.8749 17.1875C17.8749 16.8078 17.5671 16.5 17.1874 16.5C16.8077 16.5 16.4999 16.8078 16.4999 17.1875C16.4999 17.5672 16.8077 17.875 17.1874 17.875Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M2.74988 2.75H5.74988L7.75988 12.5691C7.82846 12.9067 8.01631 13.21 8.29054 13.4258C8.56477 13.6417 8.9079 13.7563 9.25988 13.7497H16.5499C16.9019 13.7563 17.245 13.6417 17.5192 13.4258C17.7934 13.21 17.9813 12.9067 18.0499 12.5691L19.2499 6.41658H6.49988" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
    </>
  );
};

export default Bag;
