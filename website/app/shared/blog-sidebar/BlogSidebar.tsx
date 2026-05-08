'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

type Props = {
  relatedBlogs?: any
}

const BlogSidebar = (props: Props) => {

  return (
    <div>
      {props?.relatedBlogs?.map((item: any, index: number) => <Link href={`/blogs/${item.slug}`} key={index} className='flex sm:gap-[11px] gap-[20px]  mb-5'>
        <div className='w-[56px] h-[56px] object-contain md:rounded-full overflow-hidden shrink-0 '>
          <Image
            src={item?.thumbnail}
            width={100}
            height={100}
            className='w-[56px] h-full object-cover'
            alt={item?.title}
          />
        </div>
        <div className='w-fit'>
          <p className='font-medium text-[13px] leading-[16.91px] line-clamp-2'>{item.title}</p>
          <div className='mt-[5px] md:mt-[8.91px] text-[11px] font-normal'>{item.createdAt}</div>
        </div>
      </Link>)}
      <div className='max-md:hidden'>
        <div className='w-full h-px bg-[#E5E7EB] mt-[26px]' />
        <div className='mt-[45px]'>
          {/* <Image src="https://knowearcommerce.s3.ap-south-1.amazonaws.com/blogsidebanner-1740650123315.jpg" alt='blog banner' width={260} height={1032} className='w-full h-ull' /> */}
        </div>
      </div>
    </div>

  )
}

export default BlogSidebar