import { endpoints } from '@/app/_constants/endpoints/endpoints';
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
  const collection = params.slug;

  console.log("collection",collection);

  const getCollection = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoints.collectionBySlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: collection
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  const collectionData = await getCollection();
  console.log("collectionData",collectionData);
  return {
    title: collectionData?.result?.metaTitle || 'Knowear',
    description: collectionData?.result?.metaDescription || `Browse our collection of products`,
    keywords: collectionData?.result?.metaKeywords || `Browse our collection of products`,
    alternates: {
        canonical: collectionData?.result?.canonical
    },
    openGraph: {
      title: collectionData?.result?.metaTitle || 'Knowear',
      description: collectionData?.result?.metaDescription || `Browse our collection of products`,
      images: collectionData?.result?.ogImage
    },
    twitter: {
      card: collectionData?.result?.xCard || 'summary_large_image',
      title: collectionData?.result?.metaTitle || 'Knowear',
      description: collectionData?.result?.metaDescription || `Browse our collection of products`,
      images: collectionData?.result?.ogImage
    },
  }
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 