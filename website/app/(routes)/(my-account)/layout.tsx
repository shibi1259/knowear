"use client";
import ProfileSidebar from "@/app/shared/profile-sidebar/ProfileSidebar";
import React from "react";

const layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <section className="py-6 md:pt-[23px] md:pb-[123px] bg-white">
      <div className="container max-w-full">
        <div className="grid grid-cols-4 gap-[26px] content-start">
          <div className="hidden lg:block bg-white drop-shadow-[0_1px_4px_3px_rgba(244,246,252,1)] md:rounded-2xl col-span-4 lg:col-span-1 lg:sticky lg:top-3 self-start ">
            <ProfileSidebar />
          </div>
          <div className="col-span-4 lg:col-span-3 md:bg-white md:drop-shadow-[0_1px_4px_3px_rgba(244,246,252,1)] md:pr-4 lg:pr-8 md:rounded-2xl">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default layout;
