import { endpoints } from "@/app/_constants/endpoints/endpoints";
import BlogDetails from "@/app/shared/blog-details/BlogDetails";
import BlogSidebar from "@/app/shared/blog-sidebar/BlogSidebar";
import api from "@/config/api.interceptor";
import exp from "constants";
import { Metadata } from "next";
import React from "react";

type Props = {};

const fetchData = async (params: any) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoints.blogs}/${params.slug}`,
    {
      cache: "no-cache",
    }
  );
  return response.json();
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const blogDetailsData = await fetchData({
    slug: slug,
  });

  const blogData = blogDetailsData?.result;

  const productTitle =
    blogData?.seoTitle ||
    "Blog Details";
  const productDescription =
    blogData?.seoDescription ||
    "Blog details page";

  return {
    title: blogData?.seoTitle,
    description: blogData?.seoDescription,
    keywords: blogData?.seoKeywords,
    openGraph: {
      title: blogData?.seoTitle,
      description: blogData?.seoDescription,
      images: [
        {
          url: blogData?.ogImage,
          alt: blogData?.seoTitle,
        },
      ],
    },
    twitter: {
      card: blogData?.blogData,
      title: blogData?.seoTitle,
      description: blogData?.seoDescription,
    },
    alternates: {
      canonical: blogData?.canonicalUrl,
    },
  };
}

const page = async ({ params }: any) => {
  const respone = await fetchData(params);

  return (
    <section className="pt-6 pb-[150px]">
      <div className="container max-w-full">
        <div className="grid grid-cols-5  gap-[35px] md:gap-14">
          <div className="col-span-5 md:col-span-4">
            <BlogDetails details={respone?.result} />
          </div>
          <div className="col-span-5 md:col-span-1">
            <div className="text-sm font-bold mb-5">Blog Post List</div>
            <BlogSidebar relatedBlogs={respone?.result?.relatedBlogs} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default page;
