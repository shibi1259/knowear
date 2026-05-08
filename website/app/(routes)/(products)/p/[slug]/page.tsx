import { Metadata } from "next";
import React from "react";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ProductDetails from "@/app/shared/product-details/ProductDetails";

const fetchProductDetails = cache(async (slug: string, deviceToken: string, token: string) => {
  const productDetails = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product-details`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Devicetoken': deviceToken,
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ keyword: slug }),
    next: { revalidate: 300 } // 5 minutes cache for faster repeat visits
  });

  if (!productDetails.ok) {
    throw new Error(`Failed to fetch product details for slug: ${slug}`);
  }

  return productDetails.json();
});

const getRequestAuthContext = cache(() => {
  const deviceToken = cookies().get("device_token")?.value || generateUUID();
  const token = cookies().get("access_token")?.value || "";
  return { deviceToken, token };
});

const getProductDetails = async (slug: string) => {
  const { deviceToken, token } = getRequestAuthContext();

  return fetchProductDetails(slug, deviceToken, token);
};

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  try {
    const slug = params?.slug || "";
    const productResponse = await getProductDetails(slug);
    const seoDetails = productResponse?.result?.metaDetails;
    const productDetails = productResponse?.result?.productDetails;

    return {
      title: seoDetails?.metaTitle || productDetails?.name?.text || "Knowear",
      description: seoDetails?.metaDescription || "Knowear",
      keywords: seoDetails?.metaKeywords,
      openGraph: {
        title: seoDetails?.metaTitle || productDetails?.name?.text || "Knowear",
        description: seoDetails?.metaDescription || "Knowear",
        images: seoDetails?.ogImage,
      },
      alternates: {
        canonical: seoDetails?.canonicalUrl || `${process.env.NEXT_PUBLIC_BASE_URL}p/${slug}`,
      },
      twitter: {
        title: seoDetails?.metaTitle || productDetails?.name?.text || "Knowear",
        description: seoDetails?.metaDescription || "Knowear",
        images: seoDetails?.ogImage,
        card: seoDetails?.xTag,
      },
    };
  } catch (error) {
    return {
      title: "Knowear",
      description: "Knowear",
    };
  }
}

const page = async ({ params }: { params: { slug: string } }) => {
  let productResponse;
  try {
    productResponse = await getProductDetails(params.slug);
  } catch (error) {
    console.error('Error fetching product details:', error);
    notFound();
  }

  if (!productResponse?.result?.productDetails) {
    notFound();
  }

  return (
    <div>
      <ProductDetails
        productSlug={params.slug}
        productDetails={productResponse?.result?.productDetails}
      />
    </div>
  )
}

export default page

function generateUUID(): string {
  const randomBytes = new Uint8Array(16);

  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 16; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40;
  randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;

  let uuid = '';
  for (let i = 0; i < 16; i++) {
    uuid += randomBytes[i].toString(16).padStart(2, '0');
    if (i === 3 || i === 5 || i === 7 || i === 9) {
      uuid += '-';
    }
  }

  return uuid;
}
