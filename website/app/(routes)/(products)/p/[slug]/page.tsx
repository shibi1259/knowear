import ProductDetails from '@/app/shared/product-details/ProductDetails';
import { Metadata } from 'next';
import { setDeviceToken } from '@/lib/utils';
import { cookies } from 'next/headers';
import React from 'react';
import { any } from 'zod';

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  try {
    const productResponse = await getProductDetails(params?.slug);
    const seoDetails = productResponse?.result?.metaDetails;
    const productDetails = productResponse?.result?.productDetails;
    return {
      title: seoDetails.metaTitle,
      description: seoDetails.metaDescription,
      keywords: seoDetails.metaKeywords,
      openGraph: {
        title: seoDetails.metaTitle,
        description: seoDetails.metaDescription,
        images: seoDetails.ogImage,
      },
      alternates: {
        canonical: seoDetails.canonicalUrl,
      },
      twitter: {
        title: seoDetails.metaTitle,
        description: seoDetails.metaDescription,
        images: seoDetails.ogImage,
        card: seoDetails.xTag,
      },
      other: {
        'application/ld+json': JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": process.env.NEXT_PUBLIC_BASE_URL
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Products",
              "item": process.env.NEXT_PUBLIC_BASE_URL + "products"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": productDetails?.name?.text || "Product",
              "item": process.env.NEXT_PUBLIC_BASE_URL + `p/${params.slug}`
            }
          ]
        })
      }
    }
  } catch (error) {
    console.error('Error fetching SEO details:', error);
    return {
      title: "Knowear",
      description: "Knowear",
    }
  }
}

const getProductDetails = async (slug: string) => {
  let deviceToken = cookies().get("device_token")?.value;

  if(!deviceToken){
       deviceToken = generateUUID();
       setDeviceToken(deviceToken);
  }
  
  
  const token = cookies().get("access_token")?.value;
  const productDetails = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product-details`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Devicetoken': deviceToken ?? '',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ keyword: slug })
  })

  return productDetails.json();
}

const getRelatedProducts = async (slug: string) => {
  let deviceToken = cookies().get("device_token")?.value;
  const token = cookies().get("access_token")?.value;

  if(!deviceToken){
    deviceToken = generateUUID();
    setDeviceToken(deviceToken);
   }


  const relatedProducts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/related-products/${slug}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Devicetoken': deviceToken ?? '',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  })

  return relatedProducts.json();
}

const page = async ({ params }: { params: { slug: string } }) => {
  const productResponse = await getProductDetails(params.slug);
  const relatedProductResponse = await getRelatedProducts(params.slug)

  return (
    <div>
      <ProductDetails
        relatedProducts={relatedProductResponse?.result}
        productDetails={productResponse?.result?.productDetails}
      />
    </div>
  )
}

export default page


function generateUUID(): string {
  // Generate random bytes
  const randomBytes = new Uint8Array(16);
  
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(randomBytes);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < 16; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  
  // Set version bits (v4)
  randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40;
  // Set variant bits
  randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;
  
  // Convert to hex string
  let uuid = '';
  for (let i = 0; i < 16; i++) {
    uuid += randomBytes[i].toString(16).padStart(2, '0');
    // Add hyphens at specific positions
    if (i === 3 || i === 5 || i === 7 || i === 9) {
      uuid += '-';
    }
  }
  
  return uuid;
}