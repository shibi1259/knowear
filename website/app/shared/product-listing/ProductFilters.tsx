"use client";
import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Grid from "@/public/svgs/Grid";
import FilterSettings from "@/public/svgs/FilterSettings";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  isGrid: number;
  params: string[];
  setIsGrid: (value: number) => void;
  filterData: any;
  setFilterData: (item: any) => void;
  setPage: (item: any) => void;
  filters: any;
  isCollection?: boolean;
  headers?: any
};

const ProductFilters = (props: Props) => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const params = useParams();
  const router = useRouter();
  const { filterData, filters, setFilterData } = props;
  const [priceFilter, setPriceFilter] = useState({
    low: filters?.price?.low ? Math.floor(filters.price.low) : filters?.price?.low,
    high: filters?.price?.high ? Math.floor(filters.price.high) : filters?.price?.high,
  });
  const [open, setOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<any>(props?.isCollection ? [] : params?.slug || []);

  const colors = filters?.color;
  const sizes = filters?.sizes;

  useEffect(() => {
    setPriceFilter({
      low: filters?.price?.low ? Math.floor(filters.price.low) : filters?.price?.low,
      high: filters?.price?.high ? Math.floor(filters.price.high) : filters?.price?.high,
    });
  }, [filters?.price]);

  console.log(priceFilter, "priceFilter");
  

  const handleCheckboxChange = (slug: string) => {
    setSelectedCategories((prev: any) => {
      let newCategories;
      if (prev.includes(slug)) {
        // Remove slug if it's already selected
        newCategories = prev.filter((item: any) => item !== slug);
      } else {
        // Add slug if it's not selected
        newCategories = [...prev, slug];
      }
      // Update URL
      updateURL(newCategories);
      return newCategories;
    });
  };

  const updateURL = (categories: string[]) => {
    let baseUrl = pathName;

    // Create URL search params
    const params = new URLSearchParams(searchParams);
    if (props.isCollection) {
      params.set("category", categories.join("%"));
      if (categories?.length == 0) {
        baseUrl = pathName;
        params.delete("category")
      }
      const queryString = params.toString();
      const newUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      router.push(newUrl);
      return;
    }
    if (categories?.length == 0) {
      baseUrl = `/products`;
    }
    if (categories?.length == 1) {
      baseUrl = `/products/${categories[0]}`;
    }

    if (categories.length > 1) {
      // First category goes to slug, rest to search params
      const [_, ...restCategories] = categories;
      params.set("category", restCategories.join("%"));
    } else {
      params.delete("category");
    }
    // Preserve other existing search params while updating the URL
    const queryString = params.toString();
    const newUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    router.push(newUrl);
  };
  const handleClearFilters = () => {
    // Reset all filters to default values
    setSelectedCategories(props?.isCollection ? [] : []);
    setPriceFilter({
      low: filters?.price?.low ? Math.floor(filters.price.low) : filters?.price?.low,
      high: filters?.price?.high ? Math.floor(filters.price.high) : filters?.price?.high,
    });
    setFilterData({
      sort: "2", // Default sort value
      low: filters?.price?.low,
      high: filters?.price?.high,
      category: [],
      color: null,
      size: null,
    });
    props.setPage(1);
    setOpen(false)
    // Clear URL parameters
    const baseUrl = props.isCollection ? pathName : '/products';
    router.push(baseUrl);
  };
  return (
    <section className="flex pt-5 pb-4 items-center justify-between">
      <div className="font-medium text-base">{props?.headers?.title ? props?.headers?.title : ""}</div>
      <div className="flex items-center justify-end md:mr-3.5">
        <button
          className={`flex justify-center p-[5px] mr-[15px] max-md:hidden ${props.isGrid === 4 ? "bg-black " : ""
            }`}
          onClick={() => props.setIsGrid(4)}
        >
          <Grid
            width="17"
            height="14"
            viewBox="0 0 17 14"
            count={4}
            className={props.isGrid === 4 ? "stroke-white" : "stroke-black"}
          />
        </button>
        <div className="w-[0.5px] h-6 bg-black bg-opacity-50 max-md:hidden" />
        <button
          className={`mx-[15px] flex justify-center p-[5px] pl-1.5 max-md:hidden ${props.isGrid === 3 ? "bg-black" : ""
            }`}
          onClick={() => props.setIsGrid(3)}
        >
          <Grid
            count={3}
            className={props.isGrid === 3 ? "stroke-white" : "stroke-black"}
            width="12"
            height="14"
            viewBox="0 0 12 14"
          />
        </button>
        <div className="w-[0.5px] h-6 bg-black bg-opacity-50 max-md:hidden" />
        <div className="md:ml-[15px]">
          <Sheet
            open={open}
            onOpenChange={(e) => {
              setOpen(e);
              props.setPage(1);
              if (!e) {
                setFilterData({
                  ...filterData,
                  low: +priceFilter?.low,
                  high: +priceFilter?.high,
                  category:
                    selectedCategories?.length > 0 ? selectedCategories : [],
                });
              }
            }}
          >
            <SheetTrigger className="flex justify-center items-center gap-x-2 text-black font-normal text-sm">
              Filter <FilterSettings />
            </SheetTrigger>
            <SheetContent iconClassName="md:right-[138px] md:top-[41px]" className=" w-full sm:max-w-[683px] p-0 pt-5 md:pt-9 mb-0 h-screen overflow-auto">
              <SheetHeader className="px-[15px] md:px-[124px]">
                <SheetTitle className="text-xl md:text-[25px] font-medium md:font-semibold leading-[28.9px] md:leading-[36.13px]">
                  Show filters
                </SheetTitle>
                <button
                  onClick={handleClearFilters}
                  className="mr-4 flex justify-center items-center gap-x-2 text-black font-normal text-sm"
                >
                  Clear Filters
                </button>
              </SheetHeader>
              <SheetDescription className="pt-[42px] md:pt-12">
                <div
                  className={`h-[80vh] overflow-y-auto  px-[15px] md:px-[124px] pb-11 md:pb-[49px]`}
                >
                  {/* sort  */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`sort`}>
                      <AccordionTrigger className="text-sm leading-4 pt-0 pb-6 text-black lg:text-sm font-semibold text-left hover:no-underline">
                        Order by
                      </AccordionTrigger>
                      <AccordionContent className="text-sm pb-7 border-b border-[#E5E7EB]">
                        <RadioGroup
                          onValueChange={(e) =>
                            setFilterData({ ...filterData, sort: e })
                          }
                          defaultValue={filterData?.sort || "default"}
                          className="flex flex-col  gap-x-[19px] md:gap-x-11 pl-4"
                        >
                          <div className="flex items-center gap-x-[9px] text-black pb-[15px]">
                            <RadioGroupItem className="" value="2" />
                            <div>
                              <Label
                                htmlFor="2"
                                className="font-normal text-sm "
                              >
                                Default
                              </Label>
                            </div>
                          </div>
                          <div className="flex items-center gap-x-[9px] text-black pb-[15px]">
                            <RadioGroupItem className="" value="0" />
                            <div>
                              <Label htmlFor="priceLowToHigh" className="1">
                                Priced from low to high
                              </Label>
                            </div>
                          </div>
                          <div className="flex items-center gap-x-[9px] text-black ">
                            <RadioGroupItem className="" value="1" />
                            <div>
                              <Label htmlFor="1" className="1">
                                Priced from high to low
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  {/* Activities */}
                  {/* {filterdata?.map((filterItem, index) => (
                    <Accordion
                      key={index}
                      type="single"
                      collapsible
                      className="w-full pt-10"
                    >
                      <AccordionItem
                        value={filterItem?.title}
                        className={` ${
                          index + 1 !== filterdata?.length
                            ? "border-b"
                            : "border-b"
                        } border-[#E5E7EB]`}
                      >
                        <AccordionTrigger className="text-base pb-5 pt-0 text-black lg:text-xl font-semibold text-left hover:no-underline">
                          {filterItem?.title}
                        </AccordionTrigger>
                        <AccordionContent className={`text-sm`}>
                          {filterItem?.list?.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center p-3 gap-x-2.5"
                            >
                              <Checkbox className="data-[state=checked]:bg-black" />
                              <p className="font-normal text-sm text-black">
                                {item.title}
                              </p>
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))} */}
                  {/* categories */}
                  <Accordion type="multiple" defaultValue={["categories"]} className="w-full pt-10">
                    <AccordionItem
                      value={"categories"}
                      className={` border-b border-[#E5E7EB]`}
                    >
                      <AccordionTrigger className="text-sm leading-4 pb-5 pt-0 text-black lg:text-sm font-semibold text-left hover:no-underline">
                        Categories
                      </AccordionTrigger>
                      <AccordionContent className={`text-sm max-h-44 overflow-y-auto custom-scrollbar`}>
                        {filters?.category?.map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center p-3 gap-x-2.5"
                          >
                            <Checkbox
                              checked={selectedCategories.includes(item.slug)}
                              onCheckedChange={() =>
                                handleCheckboxChange(item.slug)
                              }
                              className="data-[state=checked]:bg-black"
                            />
                            <p className="font-normal text-sm text-black">
                              {item.title}
                            </p>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  {/* color */}
                  {colors?._id ? (
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full pt-10"
                    >
                      <AccordionItem
                        value={colors?._id}
                        className={` border-b border-[#E5E7EB]`}
                      >
                        <AccordionTrigger className="text-sm leading-4 pb-5 pt-0 text-black lg:text-sm font-semibold text-left hover:no-underline">
                          {colors?._id}
                        </AccordionTrigger>
                        <AccordionContent
                          className={`text-sm md:grid md:grid-cols-4 md:gap-x-4 md:gap-y-2.5 max-md:flex max-md:flex-wrap max-md:gap-2.5`}
                        >
                          {colors?.attributes?.map(
                            (item: any, index: number) => (
                              <button
                                onClick={() => {
                                  setFilterData({
                                    ...filterData,
                                    color: item?.attribute,
                                  });
                                }}
                                key={index}
                                className={`border px-[5px] py-[5px] w-fit max-md:rounded-full ${filterData.color == item?.attribute
                                  ? "border-black"
                                  : "max-md:border-0 md:border-[#E5E7EB]"
                                  }`}
                              >
                                <div
                                  className="size-5 md:size-[74px] max-md:rounded-full"
                                  style={{ background: item?.attribute }}
                                ></div>
                                {/* <p className="pt-2 text-black font-normal text-xs max-md:hidden">
                              {item.title}
                            </p> */}
                              </button>
                            )
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : null}
                  {/* {sizes?._id ? (
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full pt-10"
                    >
                      <AccordionItem
                        value={sizes?._id}
                        className={` border-b border-[#E5E7EB]`}
                      >
                        <AccordionTrigger className="text-sm leading-4 pb-5 pt-0 text-black lg:text-sm font-semibold text-left hover:no-underline">
                          {sizes?._id}
                        </AccordionTrigger>
                        <AccordionContent
                          className={`text-sm flex flex-wrap gap-[15px]`}
                        >
                          {sizes?.attributes?.map(
                            (item: any, index: number) => (
                              <button
                                onClick={() =>
                                  setFilterData({
                                    ...filterData,
                                    size: item?.attribute,
                                  })
                                }
                                key={index}
                                className={`flex text-black items-center justify-center border w-[45px] py-3 ${filterData?.size === item?.attribute
                                  ? "border-black"
                                  : "border-[#E5E7EB]"
                                  }`}
                              >
                                {item?.attribute}
                              </button>
                            )
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : null} */}
                  {sizes?._id ? (
  <Accordion
    type="single"
    collapsible
    className="w-full pt-10"
  >
    <AccordionItem
      value={sizes?._id}
      className={` border-b border-[#E5E7EB]`}
    >
      <AccordionTrigger className="text-sm leading-4 pb-5 pt-0 text-black lg:text-sm font-semibold text-left hover:no-underline">
        {sizes?._id}
      </AccordionTrigger>
      <AccordionContent
        className={`text-sm flex flex-wrap gap-[15px]`}
      >
        {sizes?.attributes?.sort((a: { attribute: string }, b: { attribute: string }) => {
          const sizeOrder: Record<string, number> = {
            'XXS': 1,
            'XS': 2,
            'S': 3,
            'M': 4,
            'L': 5,
            'XL': 6,
            'XXL': 7,
            'XXXL': 8
          };
          const sizeA = a.attribute.toUpperCase();
          const sizeB = b.attribute.toUpperCase();
          return (sizeOrder[sizeA] || 999) - (sizeOrder[sizeB] || 999);
        }).map(
          (item: { attribute: string }, index: number) => (
            <button
              onClick={() =>
                setFilterData({
                  ...filterData,
                  size: item.attribute,
                })
              }
              key={index}
              className={`flex text-black items-center justify-center border w-[45px] py-3 ${
                filterData?.size === item.attribute
                  ? "border-black"
                  : "border-[#E5E7EB]"
              }`}
            >
              {item.attribute}
            </button>
          )
        )}
      </AccordionContent>
    </AccordionItem>
  </Accordion>
) : null}
                  <Accordion type="single" collapsible className="w-full pt-10">
                    <AccordionItem value={"price"} className={` border-0`}>
                      <AccordionTrigger className="font-semibold leading-4 text-sm pb-5 pt-0 text-black lg:text-sm text-left hover:no-underline">
                        Price Range
                      </AccordionTrigger>
                      <AccordionContent className={`pt-3.5 md:pt-[11px] pl-3`}>
                        <div className="flex justify-between pb-[26px]">
                          <p className="font-normal text-[#4B5563] text-sm ">
                            Range
                          </p>
                          <div className="flex gap-x-1 font-normal text-sm text-black">
                            <p>AED {priceFilter?.low}</p>
                            <p>-</p>
                            <p>AED {priceFilter?.high}</p>
                          </div>
                        </div>
                        <Slider
                          value={[+priceFilter?.low, +priceFilter?.high]}
                          max={+filters?.price?.max}
                          min={+filters?.price?.min}
                          step={1}
                          onValueChange={(e) =>
                            setPriceFilter({
                              ...filterData,
                              low: String(Math.floor(e[0])),
                              high: String(Math.floor(e[1])),
                            })
                          }
                          className={cn("w-full")}
                          {...props}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                <div
                  style={{
                    boxShadow: "4px 0px 4px 0px rgba(0, 0, 0, 0.15)", // Use rgba for more control over opacity
                  }}
                  className="bg-white font-bold px-[15px] md:px-[124px] absolute w-full bottom-0 text-black py-2 md:py-1.5"
                >
                  <Button
                    onClick={() => {
                      props.setPage(1);
                      setOpen(false);
                      setFilterData({
                        ...filterData,
                        low: +priceFilter?.low,
                        high: +priceFilter?.high,
                        category:
                          selectedCategories?.length > 0
                            ? selectedCategories
                            : [],
                      });
                    }}
                    className="h-[45px] md:h-[50px] !leading-none py-0  w-full flex items-center justify-center font-medium text-[15px] md:text-[17px] text-white bg-black rounded-none hover:bg-black"
                  >
                    Show Products
                  </Button>
                </div>
              </SheetDescription>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </section>
  );
};

export default ProductFilters;
