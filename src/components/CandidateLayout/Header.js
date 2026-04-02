import React from 'react'
import { IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import './styles.css'

const TopNavBar = () => {
  return (
    <div className='top-navbar'>
      {/* Left: Hamburger + Logos */}
      <div className='nav-left'>
        <IconButton className='menu-icon'>
          <MenuIcon />
        </IconButton>
        <img src='/assets/images/logo.png' alt='Logo' width={150} height={40} />
      </div>
    </div>
  )
}

export default TopNavBar
