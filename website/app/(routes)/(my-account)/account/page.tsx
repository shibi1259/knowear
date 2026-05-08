import ProfileSidebar from '@/app/shared/profile-sidebar/ProfileSidebar'
import React from 'react'

const Account = () => {
  return (
    <section className="bg-white">
      <div className=" max-w-full">
        <div className="">
          <div className="block bg-white drop-shadow-[0_1px_4px_3px_rgba(244,246,252,1)] md:rounded-2xl col-span-4 lg:col-span-1 lg:sticky lg:top-3 self-start ">
            <ProfileSidebar />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Account