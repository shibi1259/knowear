"use client"
import { useState, useEffect } from "react";
import { initialThemeData, ThemeContext } from "./ThemeContext";
import AppLoader from "@/app/shared/app-loader/AppLoader";
import { endpoints } from "@/app/_constants/endpoints/endpoints";

function ThemeProvider(props: any) {
  const [themeData, setThemeData]: any = useState(initialThemeData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchThemeData() {
      const response: any = await new Promise((resolve) => {
        setIsLoading(false);
        resolve(fetch(process.env.NEXT_PUBLIC_API_URL + endpoints.theme));
      }).catch((e) => {
        setIsLoading(false);
        console.error(e);
      });

      let data;
      try {
        data = await response.json();
      } catch(e) {
        setIsLoading(false);
        return;
      }
      if (data?.errorCode == 0) {
        setThemeData(data?.result);
      }
      const root = document.documentElement;
      const themeColor = document.querySelector('meta[name="theme-color"]');
      const favicon = document.getElementById("favicon");
      root.style.setProperty("--primary", "#000000");
      root.style.setProperty("--secondary", "#F6F6F6");
      themeColor?.setAttribute("content", data.result.colors.primary.replace(/0xFF/g, "#"));
      if (data.result.favicon) favicon?.setAttribute("href", data.result.favicon);
    }
    fetchThemeData();
  }, []);

  if (isLoading) {
    return (
      <div
        className="w-full flex items-center justify-center"
        style={{ height: "100vh" }}>
        <AppLoader />
      </div>
    );
  }

  return <ThemeContext.Provider value={themeData}>{props.children}</ThemeContext.Provider>;
}

export default ThemeProvider;
