import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {}

const EmptyOrders = (props: Props) => {
  return (
    <div className='flex flex-col items-center justify-center  md:w-[460px] mx-auto pt-5'>
      <div className='w-24 h-24 mb-6 rounded-full bg-[#F3F5F7] flex items-center justify-center'>
        <Image src={'/icons/bag.svg'} height={50} width={50} alt='Wishlist' />
      </div>
      <div className='text-3xl font-semibold'>No Orders.</div>
      <div className='mt-5 mb-10 text-center'>
        You have placed no orders.
      </div>
      <Link className='bg-black py-3 px-6 text-white' href={'/'}>Continue Shopping</Link>
    </div>
  )
}

export default EmptyOrders