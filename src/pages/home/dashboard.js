import React, { useEffect, useState } from 'react'
import AnnouncmentModal from '../Employees/announcements/modal'
import { supabase } from '../../supabaseClient'
import { useUser } from '../../context/UserContext'

const Dashboard = () => {
  const { user } = useUser()
  return (
    <>
      <h1>hello world</h1>
      {user?.role === 'employee' && <AnnouncmentModal user={user} />}
    </>
  )
}

export default Dashboard
