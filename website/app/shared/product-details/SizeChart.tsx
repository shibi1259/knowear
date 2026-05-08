"use client";
import React, { useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";

type Props = {
    description: string;
    attributeItems: Array<any>;
    selectedSize: string;
    setSelectedSize: (size: string) => void;
};

const SizeChart = ({ description, attributeItems, selectedSize, setSelectedSize }: Props) => {


    const [attributes, setAttributes] = React.useState([]);

    useEffect(() => {
        attributeItems?.map((item: any, index: number) => {
            switch (item?.title) {
                case "Size":
                    setAttributes(item?.values);
                    break;
            }
        });
    }, [attributeItems]);

    useEffect(() => {
        // Define the size order mapping for letter sizes
        const sizeOrder: any = {
            'XXS': 0,
            'XS': 1,
            'S': 2,
            'M': 3,
            'L': 4,
            'XL': 5,
            'XXL': 6,
            'XXXL': 7
        };

        attributeItems?.map((item: any, index: number) => {
            if (item?.title === "Size") {
                const sortedSizes = item?.values.sort((a: string, b: string) => {
                    // Convert to numbers if both are numeric
                    const numA = Number(a);
                    const numB = Number(b);

                    // If both are valid numbers, sort numerically
                    if (!isNaN(numA) && !isNaN(numB)) {
                        return numA - numB;  // This will sort 39, 45, 78 correctly
                    }

                    // Convert to uppercase for letter size comparison
                    const sizeA = a.toUpperCase();
                    const sizeB = b.toUpperCase();

                    // Get order values (use MAX_VALUE if not in sizeOrder)
                    const orderA = sizeOrder[sizeA] ?? Number.MAX_VALUE;
                    const orderB = sizeOrder[sizeB] ?? Number.MAX_VALUE;

                    return orderA - orderB;
                });

                setAttributes(sortedSizes);
            }
        });
    }, [attributeItems]);
    return (
        <>
            <div className="py-5 lg:py-[18px] mt-[13px] lg:mt-5 mb-[27px] lg:mb-[30px] border-y-[1.5px] border-y-[#E5E7EB]">
                <div className="flex justify-between items-center">
                    <div className="md:flex items-center gap-x-2.5">
                        <label className="text-black font-normal text-sm leading-4">Size :</label>
                        <div className="max-md:hidden flex gap-[15px] items-center">
                            {attributes?.map((valueItem: string, index: number) => {
                                return (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            setSelectedSize(valueItem);
                                        }}
                                        className={`text-sm leading-4 font-normal cursor-pointer  ${selectedSize == valueItem && "border border-[#000000] px-2.5 py-[3px]"} `}
                                    >
                                        {valueItem}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <Sheet>
                        <SheetTrigger className="md:my-auto text-[14px]  underline md:uppercase leading-4">Size Chart</SheetTrigger>
                        <SheetContent className="w-full sm:max-w-2xl">
                            <SheetHeader>
                                <SheetDescription>
                                    <div>
                                        <Image
                                            priority={true}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                                            quality={100}
                                            height={350}
                                            width={200}
                                            src={description}
                                            alt="size chart"
                                            className="group-hover:scale-105 transition duration-300 ease-in-out w-full h-[90vh] object-contain"
                                        />
                                    </div>
                                </SheetDescription>
                            </SheetHeader>
                        </SheetContent>
                    </Sheet>
                </div>
                <div className="mt-[18px] md:hidden">
                    <ul className="flex justify-start items-center gap-[15px]">
                        {attributes?.map((valueItem: string, index: number) => {
                            return (
                                <li
                                    key={index}
                                    onClick={() => {
                                        setSelectedSize(valueItem);
                                    }}
                                    className={`text-black border cursor-pointer font-normal text-sm w-[45px] h-11 bg-white ${selectedSize == valueItem ? " border-[#000000]" : "border-[#E5E7EB]"
                                        } grid place-items-center uppercase`}
                                >
                                    {valueItem}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default SizeChart;
