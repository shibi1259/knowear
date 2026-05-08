import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {}

const EmptyWishlist = (props: Props) => {
  return (
    <div className='flex flex-col items-center justify-center  md:w-[460px] mx-auto'>
      <div className='w-24 h-24 mb-6 rounded-full bg-[#F3F5F7] flex items-center justify-center'>
        <Image src={'/heart.png'} height={50} width={50} alt='Wishlist' />
      </div>
      <div className='md:text-3xl text-lg font-semibold max-md:text-center'>Your wishlist is empty.</div>
      <div className='mt-5 max-md:mt-1.5 mb-11 md:mb-[42px] text-center max-md:text-[13px]'>
        You dont have any products in the wishlist yet. You will find a lot
        of interesting products on our Shop page.
      </div>
      <Link className='bg-black py-3 px-6 text-white' href={'/'}>Continue Shopping</Link>
    </div>
  )
}

export default EmptyWishlist