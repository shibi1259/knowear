import CareerForm from '@/app/shared/career-form/CareerForm'
import Image from 'next/image'
import React from 'react'

type Props = {}

export async function generateMetadata() {
  return {
    title: "Careers at KnoWear",
    description: "Join our team and be part of a community that values sustainability, empowerment, and social impact.",
    keywords: "Careers, KnoWear, Jobs, Employment, Opportunities, Teamwork, Growth, Fashion, Sustainability, Social Impact",
    openGraph: {
      title: "Careers at KnoWear",
      description: "Join our team and be part of a community that values sustainability, empowerment, and social impact.",
      images: "https://knowear.me/_next/static/media/logo.38d4518e.svg",
    },
    alternates: {
      canonical: "https://www.knowear.com/careers",
    },
    twitter: {
      title: "Careers at KnoWear",
      description: "Join our team and be part of a community that values sustainability, empowerment, and social impact.",
      images: "https://knowear.me/_next/static/media/logo.38d4518e.svg",
      card: "summary",
    },
  };
}
const page = (props: Props) => {
    return (
        <section className='pt-6 pb-[60px] md:pb-32'>
            <div className='container max-w-full'>
                <div>
                    <h1 className='text-xl lg:text-4xl font-medium'>Careers</h1>
                    <div className='mt-2 text-xs lg:text-sm'>Your next journey starts here.</div>
                    <div className='mt-5 mb-[26px] md:mb-8 text-xs lg:text-sm'>
                    At KnoWear, we do not just sell sportwear, but we’re building a community of like-minded people who care about the planet and its people. By joining our team, you’re contributing a collective effort that values sustainability, empowerment, and social impact. Let us make a difference together, and develop a culture where the entrepreneurial spirit thrives. 
                    Stay up to date with the latest job openings by joining our network! Enter your e-mail and tell us a bit about yourself, and we will notify you about upcoming events and opportunities that match your interests.
                    </div>
                    <div className='grid grid-cols-2 lg:grid-cols-3 gap-[11px] md:gap-8'>
                        <div className='max-md:mb-[36px]'>
                            <div className='h-[52px] w-[52px] md:h-[74px] md:w-[74px] bg-[#F2F2F2] grid place-items-center mb-3 md:mb-8 max-md:p-3'>
                                <Image src={'/team-work.svg'} alt='Team Work' height={50} width={50} />
                            </div>
                            <div className='text-lg font-bold'>Team work</div>
                            <div className='text-sm max-w-72 mt-[2px] md:mt-2'>At KnoWear Fashion, we believe in the power of collaboration. Our team thrives on mutual respect, creativity, and support, working together to deliver exceptional results. Join us to be part of a close-knit community that values every contribution.
                            </div>
                        </div>
                        <div>
                            <div className='h-[52px] w-[52px] md:h-[74px] md:w-[74px] bg-[#F2F2F2] grid place-items-center mb-3 md:mb-8 max-md:p-3'>
                                <Image src={'/secured-future.svg'} alt='Team Work' height={50} width={50} />
                            </div>
                            <div className='text-lg font-bold'>Secured Future</div>
                            <div className='text-sm max-w-72 mt-[2px] md:mt-2'>We invest in your future with career stability and growth opportunities. At KnoWear Fashion, we prioritize employee well-being, offering a secure and sustainable work environment that enables you to thrive professionally and personally.</div>
                        </div>
                        <div>
                            <div className='h-[52px] w-[52px] md:h-[74px] md:w-[74px] bg-[#F2F2F2] grid place-items-center mb-3 md:mb-8 max-md:p-3'>
                                <Image src={'/learning-oppurtunity.svg'} alt='Team Work' height={50} width={50} />
                            </div>
                            <div className='text-lg font-bold'>Learning Opportunity</div>
                            <div className='text-sm max-w-72 mt-[2px] md:mt-2'>Our culture encourages continuous learning and development. KnoWear Fashion provides ample training and skill enhancement programs, ensuring our team stays ahead in the fast-paced fashion industry.</div>
                        </div>
                    </div>
                </div>
                <CareerForm/>
            </div>
        </section>
    )
}

export default page