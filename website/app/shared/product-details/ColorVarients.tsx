"use client";
import React, { useEffect } from "react";

type Props = {
  attributeItems: Array<any>;
  setSelectedColor: (color: string) => void;
  selectedColor: string;
};

const ColorVarients = ({ attributeItems, setSelectedColor, selectedColor }: Props) => {
  const [attributes, setAttributes] = React.useState([]);

  useEffect(() => {
    if (attributeItems) {
      attributeItems?.map((item: any, index: number) => {
        switch (item?.title) {
          case "Color":
            setAttributes(item?.values)
            break;
        }
      })
    }
  }, [attributeItems])

  return (
    <>
      <div className="flex flex-wrap gap-[10px] mt-[30px] lg:mt-[27px] max-w-full items-center">
        <p className="text-sm text-black font-normal">Color variants :</p>
        {
          attributes && <div className="flex gap-[10px] items-center">
            {
              attributes?.map((valueItem: string, index: number) => {
                return <button key={index}
                  onClick={() => {console.log("Asdasd",valueItem);
                   setSelectedColor(valueItem) }}

                  className={`size-[30px] rounded-full flex justify-center items-center ${selectedColor == valueItem && 'border border-black'}`}
                  aria-label="Stone color variant"
                >
                  <div style={{ backgroundColor: valueItem }} className="flex shrink-0 self-stretch my-auto w-5 h-5 rounded-full">

                  </div>
                </button>
              })
            }
          </div>
        }
      </div>
    </>
  );
};

export default ColorVarients;
