'use client';
import { endpoints } from '@/app/_constants/endpoints/endpoints';
import BlogCard from '@/app/shared/blog-card/BlogCard';
import BlogSidebar from '@/app/shared/blog-sidebar/BlogSidebar';
import api from '@/config/api.interceptor';
import React, { useEffect } from 'react'

type Props = {}

const Blogs = (props: Props) => {
  const [blogs, setBlogs] = React.useState([])
  const [relatedBlogs, setRelatedBlogs] = React.useState([])
  const [page, setPage] = React.useState(1)
  const [isLastPage, setIsLastPage] = React.useState(false)
  const [categories, setCategories] = React.useState([])

  const fetchData = async () => {
    await api.post('/blogs').then((res) => {
      if (res?.data?.errorCode == 0) {
        setBlogs(res.data?.result?.blogs?.data)
        setIsLastPage(res.data?.result?.blogs?.isLastPage)
      } else { }
    }).catch((err: any) => { })
  }

  const fetchRelatedBlogs= async()=>{
    await api.post(endpoints.relatedBlogs).then((res)=>{
      if (res?.data?.errorCode == 0) {
        setRelatedBlogs(res.data?.result?.blogs?.data)
      } else { } 
    })
  }

  useEffect(() => {
    fetchData()
    fetchRelatedBlogs()
  }, [])

  return (
    <section className='pt-[26px] md:pt-[23px] pb-[150px]'>
      <div className='container max-w-full'>
        <div className='grid grid-cols-5 gap-[35px] sm:gap-14'>
          <div className='md:col-span-4 col-span-5'>
            <h1 className='text-xl md:text-[25px] mb-[15px] md:mb-5 font-medium  md:font-semibold leading-[28.9px] md:leading-[36.13px]'>Our Blogs</h1>
            <div>
              {
                blogs?.map((blog: any, index: number) => (
                  <div key={index} className='mb-8 last:mb-0'>
                    <BlogCard blog={blog} />
                  </div>
                ))
              }
            </div>
          </div>
          <div className='col-span-5  md:col-span-1 md:pt-[46px]'>
          <div className="text-sm font-bold mb-5 ">Blog Post List</div>
            <BlogSidebar relatedBlogs={relatedBlogs}/>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Blogs