import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/config/api.interceptor";
import Cross2 from "@/public/svgs/Cross2";
import Undo from "@/public/svgs/Undo";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import SearchProductCard from "./SearchProductCard";
import { StateContext } from "@/providers/state/StateContext";
import Cookies from "js-cookie";

const SearchPopup = ({ setSearchPopUp }: any) => {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any>({});
  const [popularSearches, setPopularSearches] = useState([]);
  const [refetch, setRefetch] = useState(0);
  const [refetchPopularSearches, setRefetchPopularSearches] = useState(0);
  const debounceDelay = 500; // delay time in ms
  const { wishlistDetails } = useContext(StateContext);
  const token = Cookies.get("access_token");

  useEffect(() => {
    if (searchParams?.get("search")) {
      const value = searchParams?.get("search") || "";
      setSearchValue(value);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    setIsLoading(true);
    api
      .get(endpoints.searchSuggestions + searchValue)
      .then((response: any) => {
        if (response.data.errorCode === 0) {
          setSuggestions(response.data.result);
        }
        setIsLoading(false);
      })
      .catch((error: any) => {
        setIsLoading(false);
      });
  };

  const fetchPopularSearches = async () => {
    setIsLoading(true);
    api
      .get(endpoints.popularSearch)
      .then((response: any) => {
        if (response.data.errorCode === 0) {
          setPopularSearches(response.data?.result?.popularSearches || []);
        }
        setIsLoading(false);
      })
      .catch((error: any) => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchPopularSearches();
  }, [refetchPopularSearches]);

  useEffect(() => {
    // Clear the previous timer if searchValue changes
    const handler = setTimeout(() => {
      fetchProducts();
    }, debounceDelay);

    // Cleanup timeout if searchValue changes before debounceDelay ends
    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line
  }, [searchValue, refetch]);

  const deleteHistoryItem = async (item: string) => {
    api
      .get(endpoints.searchSuggestions + `&delete=${item}`)
      .then((response: any) => {
        if (response.data.errorCode === 0) {
          setSuggestions(response.data.result);
        }
        setIsLoading(false);
        setRefetch((prev) => prev + 1);
      })
      .catch((error: any) => {
        setIsLoading(false);
      });
  };

  return (
    <div>
      <div className="h-[57px]  px-[11px] flex justify-between bg-white items-center gap-x-2 max-md:w-[100vw]">
        <div className="flex items-center gap-1.5 w-1/2 md:w-full">
          <button
            onClick={() => {
              router.push(pathName);
              setSearchValue("");
              setSearchPopUp(false);
            }}
            className="focus-visible:outline-none"
          >
            <Cross2 />
          </button>
          <Input
            value={searchValue}
            className="bg-white text-black text-xs w-full placeholder:text-opacity-50 font-normal border-0 focus:outline-none"
            placeholder="Search here"
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (!e.target.value) {
                router.push(pathName);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && searchValue?.length) {
                setSearchPopUp(false);
                router.push(`/products?search=${searchValue}`);
              }
            }}
          />
        </div>
        <Button
          onClick={() => {
            router.push(`/products?search=${searchValue}`);
            setRefetchPopularSearches((prev) => prev + 1);
            setSearchPopUp(false);
          }}
          className="h-[45px] rounded-none bg-black hover:bg-black text-white w-[110px] flex items-center justify-center text-sm font-medium"
        >
          Search
        </Button>
      </div>
      <div className="h-[15px] bg-transparent w-full"></div>
      <div className="grid max-md:grid-rows-1 md:grid-cols-8 bg-white pt-4 px-6 md:pb-[54px] pb-4">
        <div className="max-md:row-span-1 md:col-span-2">
          {token ? (
            <>
              <p className="text-black text-opacity-50 text-sm font-normal text-left mb-px">
                Your searches
              </p>
              {suggestions?.searchHistory?.length ? (
                suggestions?.searchHistory?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2"
                  >
                    <button
                      onClick={() => setSearchValue(item)}
                      className="flex items-center gap-x-[13px] text-sm"
                    >
                      <Undo />
                      {item}
                    </button>
                    <button onClick={() => deleteHistoryItem(item)}>
                      <Cross2 />
                    </button>
                  </div>
                ))
              ) : (
                <p className="font-normal text-sm md:text-xs text-black text-opacity-50 text-center pt-2">
                  No recent searches
                </p>
              )}
            </>
          ) : (
            <></>
          )}
          <div>
            <p
              className={`text-sm text-black text-opacity-50 ${
                token ? "mt-4" : ""
              }`}
            >
              Popular searches
            </p>
            {popularSearches?.length ? (
              <div className="py-3 flex gap-3 flex-wrap max-md:w-[80%]">
                {popularSearches?.map((item: any) => (
                  <button
                    onClick={() => {
                      router.push(`/products?search=${item?.text}`);
                      setRefetchPopularSearches((prev) => prev + 1);
                      setSearchPopUp(false);
                    }}
                    key={item?.text}
                    className="bg-[#F3F5F7] border border-[#E5E7EB] p-2 text-xs text-[#4F5162] font-medium"
                  >
                    {item?.text}
                  </button>
                ))}
              </div>
            ) : (
              <p className="font-normal text-sm md:text-xs text-black text-opacity-50 text-center pt-2">
                No searches
              </p>
            )}
          </div>
        </div>
        <div className="max-md:row-span-3 md:col-span-6 md:ml-9">
          <p className="text-black text-opacity-50 text-sm font-normal text-left">
            You may be interested
          </p>
          {suggestions?.suggestions?.length ? (
            <div className="flex py-2 gap-[15px] max-md:w-[80vw] overflow-x-auto">
              {suggestions?.suggestions?.map((item: any, index: number) => (
                <SearchProductCard
                  key={index}
                  productDetails={item}
                  wishlistDetails={wishlistDetails}
                  setSearchPopUp={setSearchPopUp}
                />
              ))}
            </div>
          ) : (
            <p className="font-normal text-sm md:text-xs text-black text-opacity-50 pt-2 max-md:text-center">
              No suggestions
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;
