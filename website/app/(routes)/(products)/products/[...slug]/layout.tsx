import { endpoints } from '@/app/_constants/endpoints/endpoints';
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
  const category = params.slug[params.slug.length - 1];

  const getCategory = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoints.categoryBySlug}`, {
        method: 'POST',
        next: { revalidate: 0 },
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: category
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  const categoryData = await getCategory();
  return {
    title: categoryData?.result?.metaTitle || 'Knowear',
    description: categoryData?.result?.metaDescription || `Browse our collection of ${category.toLowerCase()} products`,
    keywords: categoryData?.result?.metaKeywords || `Browse our collection of ${category.toLowerCase()} products`,
    alternates: {
        canonical: categoryData?.result?.metaCanonical
    },
    openGraph: {
      title: categoryData?.result?.metaTitle || 'Knowear',
      description: categoryData?.result?.metaDescription || `Browse our collection of ${category.toLowerCase()} products`,
      images: categoryData?.result?.metaImage
    },
    twitter: {
      card: categoryData?.result?.metaXCard || 'summary_large_image',
      title: categoryData?.result?.metaTitle || 'Knowear',
      description: categoryData?.result?.metaDescription || `Browse our collection of ${category.toLowerCase()} products`,
      images: categoryData?.result?.metaImage
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