import React from 'react'
import { IconButton, Avatar } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
// import QrCodeIcon from '@mui/icons-material/QrCode'
import './style.css'
import { Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { ROLES } from '../utils/constants'

const TopNavBar = () => {
  const { user } = useUser()

  const recruitmentLink = [ROLES.HR, ROLES.ADMIN, ROLES.HR_MANAGER].includes(
    user?.role
  )
    ? '/admin/recruitment/interviews-list'
    : '/recruitment/scheduled-interviews'

  return (
    <div className='top-navbar'>
      {/* Left: Hamburger + Logos */}
      <div className='nav-left'>
        <IconButton className='menu-icon'>
          <MenuIcon />
        </IconButton>
        <img src='/assets/images/logo.png' alt='Logo' width={150} height={40} />
      </div>

      {/* Center: Navigation Links */}
      <div className='nav-center'>
        <div className='nav-link'>
          <Link to='/home' className='nav-link'>
            <DashboardIcon className='nav-icon' />
            <span>Dashboard</span>
          </Link>
        </div>

        <Link to={recruitmentLink} className='nav-link'>
          <PeopleIcon className='nav-icon' />
          <span>Recruitment</span>
        </Link>
        {/* <div className="nav-link">
          <ShoppingCartIcon className="nav-icon" />
          <span>Travel & Expense Management</span>
        </div> */}
        {/* <div className='nav-link'>
          <ChatBubbleOutlineIcon className='nav-icon' />
          <span>Corporate communications</span>
        </div> */}
      </div>

      {/* Right: Profile Image */}
      <div className='nav-right'>
        <Link to='/user-profile'>
          <IconButton>
            {user?.profile_image ? (
              <Avatar src={user.profile_image} sx={{ width: 40, height: 40 }} />
            ) : (
              <Avatar sx={{ width: 40, height: 40, bgcolor: 'gray.main' }}>
                <PersonIcon />
              </Avatar>
            )}
          </IconButton>
        </Link>
      </div>
    </div>
  )
}

export default TopNavBar
