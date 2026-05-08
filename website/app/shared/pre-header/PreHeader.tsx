'use client';
import { ThemeContext } from '@/providers/theme/ThemeContext';
import Link from 'next/link'
import React, { useState, useEffect, useContext } from 'react'

type Props = {}

const PreHeader = (props: Props) => {
  // const {headerTexts} = useContext(ThemeContext) // Commented out for now, will use API later
  const messages = [
    { text: 'Proudly born in the Emirates', link: '' },
    { text: 'Made with eco-friendly fabrics', link: '' },
    { text: 'Every purchase supports a student in need', link: '' },
    { text: 'Women’s Activewear with Purpose and Performance', link: '' }
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        prevIndex === messages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className='bg-black hidden lg:block py-2'>
      <div className="container max-w-full">
        <h5 className='text-white font-normal text-[14px] text-center'>
          {messages[currentMessageIndex]?.text && messages[currentMessageIndex]?.text}{' '}

          {/* <Link href={messages[currentMessageIndex]?.link || ""} className='underline'>
            Shop Now
          </Link> */}
        </h5>
      </div>
    </section>
  )
}

export default PreHeader