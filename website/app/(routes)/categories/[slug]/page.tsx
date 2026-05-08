import React from "react";
import LeggingsCategoryPage from "@/app/shared/category/CategoryLanding";
import { redirect, useParams } from "next/navigation";
import { cookies } from "next/headers";
import { endpoints } from "@/app/_constants/endpoints/endpoints";


export async function generateMetadata({ params }: { params: { slug: string } }) {
  const productResponse = await getProductDetails(params.slug);
  const seoDetails = productResponse?.result?.category;
  return {
    title: seoDetails?.metaTitle || "Knowear",
    description: seoDetails?.metaDescription || "Knowear",
    keywords: seoDetails?.metaKeywords || "Knowear",
    openGraph: {
      title: seoDetails?.metaTitle || "Knowear",
      description: seoDetails?.metaDescription || "Knowear",
      images: seoDetails?.metaImage || "",
    },
    alternates: {
      canonical: seoDetails?.metaCanonical || "https://www.knowear.com/categories/" + params.slug,
    },
    twitter: {
      title: seoDetails?.metaTitle || "Knowear",
      description: seoDetails?.metaDescription || "Knowear",
      images: seoDetails?.metaImage || "",
      card: seoDetails?.metaXCard || "summary",
    },
  };
}

const ProductListing = async ({ params }: any) => {
  const productResponse = await getProductDetails(params.slug);

  return (
    <div className="container max-w-full">
      <LeggingsCategoryPage categorySlug={params.slug} />
    </div>
  );
};

export default ProductListing;

const getProductDetails = async (slug: string) => {
  const deviceToken = cookies().get("device_token")?.value;
  const token = cookies().get("access_token")?.value;
  const rep = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/${endpoints.categoryLandingPage}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Devicetoken: deviceToken ?? "",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ category: slug }),
    }
  );
  if (!rep.ok) {
    redirect(`/products/${slug}`);
  }
  return rep.json();
};
