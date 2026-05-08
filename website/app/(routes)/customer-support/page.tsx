import { endpoints } from '@/app/_constants/endpoints/endpoints'
import React from 'react'

const fetchData = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoints.pageContents}`,{
        cache: "no-cache",})
    return response.json()
}
const page = async () => {
    const respone = await fetchData()
    
    return (
        <section className='py-6'>
            <div className="container max-w-full">
                <h1 className='text-xl font-medium lg:text-4xl lg:font-bold mb-3'>Customer Support</h1>
                <div dangerouslySetInnerHTML={{ __html: respone?.result?.customerSupport }}></div>
            </div>
        </section>
    )
}

export default page