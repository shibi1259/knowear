import About from '@/app/shared/about/About'
import React from 'react'
import { Metadata } from 'next'
import { endpoints } from '@/app/_constants/endpoints/endpoints'
type Props = {}

const getAboutData = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoints.about}`)
    return response.json()
}

export async function generateMetadata(): Promise<Metadata> {
    const aboutResponse = await getAboutData();
    const seoDetails = aboutResponse?.result?.seoSection;
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
            canonical: seoDetails.canonical || "https://www.knowear.com/about",
        },
        twitter: {
            title: seoDetails.title || "Knowear",
            description: seoDetails.description || "Knowear",
            images: seoDetails.image,
            card: seoDetails.xCard,
        },
    }
}

const page = (props: Props) => {
    return (
        <div>
            <About />
        </div>
    )
}

export default page