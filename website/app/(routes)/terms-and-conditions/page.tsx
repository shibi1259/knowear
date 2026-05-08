import { endpoints } from '@/app/_constants/endpoints/endpoints'
import { Metadata } from 'next';
import React from 'react';

const fetchData = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoints.pageContents}`,{next: { revalidate: 0 }})
    return response.json()
}

export async function generateMetadata(): Promise<Metadata> {
    const respone = await fetchData()
    const seoDetails = respone?.result?.termsAndConditionSeoSection;
    return {
        title: seoDetails.title || "Knowear",
        description: seoDetails.description || "Knowear",
        keywords: seoDetails.keywords || "Knowear",
        openGraph: {
            title: seoDetails.title || "Knowear",
            description: seoDetails.description || "Knowear",
            images: seoDetails.image,
        },
        alternates: {
            canonical: seoDetails.canonical || "https://www.knowear.com/terms-and-conditions",
        },
        twitter: {
            title: seoDetails.title || "Knowear",
            description: seoDetails.description || "Knowear",
            images: seoDetails.image,
            card: seoDetails.xCard,
        },
    }
}

const page = async () => {
    const respone = await fetchData()

    return (
        <section className='py-6'>
            <div className="container max-w-full">
                <h1 className='text-xl font-medium lg:text-4xl lg:font-bold mb-3'>Terms & Conditions</h1>
                <div dangerouslySetInnerHTML={{ __html: respone?.result?.termsAndCondition }}></div>
            </div>
        </section>
    )
}

export default page