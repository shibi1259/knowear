import React from "react";

const FeatureList = ({ data }: any) => {
  // const features = [
  //   {
  //     icon: "https://knowearcommerce.s3.ap-south-1.amazonaws.com/compression%201%20%281%29.png",
  //     title: "High Compression",
  //     description: "For Women Sports"
  //   },
  //   {
  //     icon: "https://knowearcommerce.s3.ap-south-1.amazonaws.com/g225%20%281%29.png",
  //     title: "High-tech Value",
  //     description: "For Daily Activities"
  //   },
  //   {
  //     icon: "https://knowearcommerce.s3.ap-south-1.amazonaws.com/textile%201.png",
  //     title: "Active Sports",
  //     description: "For Active Lifestyle"
  //   },
  //   {
  //     icon: "https://knowearcommerce.s3.ap-south-1.amazonaws.com/ankle%201.png",
  //     title: "Auto Health",
  //     description: "For Your Health"
  //   }
  // ];

  return (
    <div className="w-full !mt-0">
      <div className="max-w-6xl mx-auto">
        {/* <h2 className="text-2xl font-semibold text-center mb-6 md:mb-10">
          Our Features
        </h2> */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          <div className="py-4 px-3 md:py-6 md:px-4 text-center flex flex-col items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-3">
              <img
                src={data?.thirdIcon}
                alt={data?.thirdIconTitle}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="font-medium text-sm md:text-base mb-1">
              {data?.thirdIconTitle}
            </h3>
            <p className="text-xs md:text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: data?.thirdIconDescription }}>
            </p>
          </div>

          <div className="py-4 px-3 md:py-6 md:px-4 text-center flex flex-col items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-3">
              <img
                src={data?.fourthIcon}
                alt={data?.fourthIconTitle}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="font-medium text-sm md:text-base mb-1">
              {data?.fourthIconTitle}
            </h3>
            <p className="text-xs md:text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: data?.fourthIconDescription }}>
            </p>
          </div>

          <div className="py-4 px-3 md:py-6 md:px-4 text-center flex flex-col items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-3">
              <img
                src={data?.fifthIcon}
                alt={data?.fifthIconTitle}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="font-medium text-sm md:text-base mb-1">
              {data?.fifthIconTitle}
            </h3>
            <p className="text-xs md:text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: data?.fifthIconDescription }}>
            </p>
          </div>
          <div className="py-4 px-3 md:py-6 md:px-4 text-center flex flex-col items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-3">
              <img
                src={data?.sixthIcon}
                alt={data?.sixthIconTitle}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="font-medium text-sm md:text-base mb-1">
              {data?.sixthIconTitle}
            </h3>
            <p className="text-xs md:text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: data?.sixthIconDescription }}>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureList;
