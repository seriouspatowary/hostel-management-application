import React from 'react'
import SidebarTrigger from './sidebar-trigger'
import Dashboardbreadcrumb from './breadcrumb'
import ProfileHeader from './profile-header'

const DashboardHeader = () => {
  return (
      <header className='flex items-center justify-between py-5'>
          <div className='flex items-center gap-4 justify-start flex-1'>
              <SidebarTrigger />
              <Dashboardbreadcrumb/>
          </div>
          <div className='w-full h-fit flex items-center gap-4 justify-end flex-1'>
              <ProfileHeader/>
              
          </div>
     </header>
)
}

export default DashboardHeader