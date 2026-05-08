'use client';
import Link from 'next/link'
import React from 'react'

type Props = {
  widgetDetails: any
}

const WidgetHeader = (props: Props) => {

  return (
    <>
      <div className='grid grid-cols-4 gap-1'>
        <div className='col-span-3'>
          <h5 className='text-black text-lg md:text-[35px] font-bold'>{props.widgetDetails?.title}</h5>
          <p>{props.widgetDetails?.description}</p>
        </div>
        <Link href={props.widgetDetails?.button?.link || ""} className='col-span-1 table ml-auto text-xs lg:text-[15px] text-black font-normal underline self-center'>
          {props.widgetDetails?.button?.text}
        </Link>
      </div>
    </>
  )
}

export default WidgetHeader