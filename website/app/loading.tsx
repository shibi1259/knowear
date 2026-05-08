import React from "react";
import AppLoader from "./shared/app-loader/AppLoader";

export default function HomeLoading() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
      aria-busy="true"
      aria-live="polite"
    >
      <AppLoader width="80" height="80" />
    </div>
  );
}
