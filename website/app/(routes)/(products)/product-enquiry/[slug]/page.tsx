import ProductEnquiry from '@/app/shared/product-enquiry/ProductEnquiry'
import { cookies } from 'next/headers'
import React from 'react'

const getProductDetails = async (slug: string) => {
    const deviceToken = cookies().get("device_token")?.value;
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

const page = async ({ params }: { params: { slug: string } }) => {
    const response = await getProductDetails(params.slug);

    return (
        <div>
            <ProductEnquiry productDetails={response?.result?.productDetails} />
        </div>
    )
}

export default page