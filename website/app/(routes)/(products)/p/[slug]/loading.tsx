import React from "react";
import AppLoader from "@/app/shared/app-loader/AppLoader";

export default function ProductLoading() {
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
