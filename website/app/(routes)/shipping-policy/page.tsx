import { endpoints } from '@/app/_constants/endpoints/endpoints'
import { Metadata } from 'next'
import React from 'react'

const fetchData = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoints.pageContents}`,{cache: "no-cache",})
    return response.json()
}

export async function generateMetadata(): Promise<Metadata> {
    const respone = await fetchData()
    const seoDetails = respone?.result?.shippingPolicySeoSection;
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
            canonical: seoDetails.canonical || "https://www.knowear.com/shipping-policy",
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
            <div className="container max-w-full shipping-policy-wrapper">
                <h1 className='text-xl font-medium lg:text-4xl lg:font-bold mb-3 '>Shipping  Policy</h1>
                <div className='text-editor-ul text-editor-ol' dangerouslySetInnerHTML={{ __html: respone?.result?.shippingPolicy }}></div>
            </div>
        </section>
    )
}

export default page