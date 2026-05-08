"use client";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import EmptyOrders from "@/app/shared/empty-states/empty-orders/EmptyOrders";
import OrderItem from "@/components/orders/OrderItem";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/config/api.interceptor";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import arrowIcon from "../../../../public/icons/backArrow.svg";
import ArrowLeft from "@/public/svgs/ArrowLeft";

type Props = {};

const Orders = (props: Props) => {
  const router = useRouter();
  const [orders, setOrders] = React.useState<any>([]);
  const [tabs, setTabs] = React.useState("active");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(4);
  const [isLastPage, setIsLastPage] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      if (!isLastPage && !loading) {
        // props.setLimit((prev)=>prev+1)
        setPage((prev: any) => prev + 1);
      }
    }
    // eslint-disable-next-line
  }, [inView, isLastPage, loading]);

  const fetchOrders = async () => {
    await api
      .post(endpoints.orders, {
        limit,
        page,
        status: tabs,
        // sort:filterData?.sort||"default"
      })
      .then((response: any) => {
        setLoading(true);
        if (response.data.errorCode == 0) {
          if (page === 1) {
            setOrders(response.data.result.orders);
            setLoading(false);
          } else {
            setOrders((prev: any) => [...prev, ...response.data.result.orders]);
            setLoading(false);
          }
          setIsLastPage(response.data.result.lastPage);
        } else {
          setLoading(false);
        }
      })
      .catch((error: any) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tabs]);

  const onTabChange = (value: string) => {
    setTabs(value);
    setPage(1);
  };

  const handleBackClick = () => {
    router.push("/account");
  };

  return (
    <div>
      <div className="flex justify-start items-center gap-[9px]">
        <Button
          variant="ghost"
          className="p-0 h-[unset] md:hidden"
          onClick={handleBackClick}
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-black text-xl lg:text-[35px] font-medium lg:font-semibold leading-[28.9px] md:leading-[50.58px]">
          My Orders
        </h1>
      </div>
      {/* {orders.length !== 0 ? ( */}
      <>
        <Tabs
          defaultValue={tabs}
          onValueChange={onTabChange}
          className="relative mr-auto w-full mt-[27px] md:mt-[30px] h-fit"
        >
          <TabsList className="w-full h-fit justify-between rounded-none border-b-2 bg-transparent p-0">
            <TabsTrigger
              value="active"
              className="text-black relative text-sm md:text-[22px] -mb-[1.5px] rounded-none data-[state=active]:border-b-[3px] border-b-transparent bg-transparent px-[18px] md:px-[53px] py-3 font-normal data-[state=active]:font-semibold  shadow-none transition-none focus-visible:ring-0 data-[state=active]:bg-[#F3F5F7] data-[state=active]:border-b-primary  data-[state=active]:shadow-none "
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="text-black relative text-sm md:text-[22px] -mb-[1.5px] rounded-none data-[state=active]:border-b-[3px] border-b-transparent bg-transparent px-[18px] md:px-[53px] py-3 font-normal data-[state=active]:font-semibold  shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary  data-[state=active]:bg-[#F3F5F7] data-[state=active]:shadow-none "
            >
              Cancelled
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-black relative text-sm md:text-[22px] -mb-[1.5px] rounded-none data-[state=active]:border-b-[3px] border-b-transparent bg-transparent px-[18px] md:px-[53px] py-3 font-normal data-[state=active]:font-semibold  shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary  data-[state=active]:bg-[#F3F5F7] data-[state=active]:shadow-none "
            >
              Completed
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-5">
            {orders?.length ? (
              orders?.map((item: any, index: number) => (
                <>
                  <div
                    key={index}
                    className={` ${
                      orders?.length !== index + 1
                        ? " md:border-[#D8D8D8] md:mb-10"
                        : ""
                    }`}
                  >
                    <OrderItem order={item} />
                    <div className={orders?.length !== index + 1?"md:h-px w-full bg-[#D8D8D8] mt-5":''}/>
                  </div>
                  
                </>
              ))
            ) : (
              <EmptyOrders />
            )}
          </TabsContent>
          <TabsContent value="cancelled" className="mt-2.5">
            {orders?.length ? (
              orders?.map((item: any, index: number) => (
                <div
                  key={index}
                  className={`pb-5 ${
                    orders?.length !== index + 1
                      ? "md:border-b md:border-[#D8D8D8] md:mb-10"
                      : ""
                  }`}
                >
                  <OrderItem order={item} />
                </div>
              ))
            ) : (
              <EmptyOrders />
            )}
          </TabsContent>
          <TabsContent value="completed" className="mt-2.5">
            {orders?.length ? (
              orders?.map((item: any, index: number) => (
                <div
                  key={index}
                  className={`pb-5 ${
                    orders?.length !== index + 1
                      ? "md:border-b md:border-[#D8D8D8] md:mb-10"
                      : ""
                  }`}
                >
                  <OrderItem order={item} />
                </div>
              ))
            ) : (
              <EmptyOrders />
            )}
          </TabsContent>
        </Tabs>
        <div ref={ref}>
          {loading && !isLastPage && (
            <p className="text-lg font-semibold text-center">
              <div className="container mx-auto my-20">
                <div className="mx-auto table">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid"
                    width="100"
                    height="100"
                    style={{
                      shapeRendering: "auto",
                      display: "block",
                      background: "transparent",
                    }}
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                  >
                    <g>
                      <circle
                        strokeDasharray="75.39822368615503 27.132741228718345"
                        r="16"
                        strokeWidth="4"
                        stroke={"rgb(0, 0, 0)"}
                        fill="none"
                        cy="50"
                        cx="50"
                      >
                        <animateTransform
                          keyTimes="0;1"
                          values="0 50 50;360 50 50"
                          dur="1.25s"
                          repeatCount="indefinite"
                          type="rotate"
                          attributeName="transform"
                        ></animateTransform>
                      </circle>
                      <g></g>
                    </g>
                  </svg>
                </div>
              </div>
            </p>
          )}
        </div>
      </>
    </div>
  );
};

export default Orders;
