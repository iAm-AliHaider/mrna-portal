import React, { useMemo } from 'react'
import {
  Avatar,
  Button,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material'
import { ExpandLess, ExpandMore, Logout } from '@mui/icons-material'
import { NavLink, useNavigate } from 'react-router-dom'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import PermIdentityIcon from '@mui/icons-material/PermIdentity';

import { useUser } from '../../context/UserContext'
import './styles.css'

const CANDIDATE_SIDEBAR_MENU = [
  {
    label: 'Personal Information',
    icon: <PermIdentityIcon />,
    path: '/public/candidates/update/:id'
  },
  {
    label: 'Offer Letter',
    icon: <DescriptionOutlinedIcon />,
    path: '/public/candidates/offer-letter'
  }
]

const Sidebar = () => {
  const [openMenus, setOpenMenus] = React.useState({})
  const navigate = useNavigate()
  const { user, logout } = useUser()

  const toggleMenu = (label, path) => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }))

    if (path) {
      navigate(path)
    }
  }

  const CANDIDATE_SIDEBAR_MENU = useMemo(() => {
    const userId = user?.id
    return [
        {
          label: 'Personal Information',
          icon: <PermIdentityIcon />,
          path: `/public/candidates/update/${userId}`
        },
        {
          label: 'Offer Letter',
          icon: <DescriptionOutlinedIcon />,
          path: '/public/candidates/offer-letter'
        },
        {
          label: 'Contract',
          icon: <DescriptionOutlinedIcon />,
          path: '/public/candidates/contract'
        }
      ]
  }, [user])

  const renderMenuItems = (items, level = 0) => {
    return items.map(item => (
      <div key={item.label}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => toggleMenu(item.label, item.path)}
            sx={{ pl: 2 + level * 4 }}
            component={item.path && !item.children ? NavLink : 'button'}
            to={item.path && !item.children ? item.path : undefined}
          >
            {level === 0 && item.icon && (
              <ListItemIcon>{item.icon}</ListItemIcon>
            )}
            <ListItemText primary={item.label} />
            {item.children ? (
              openMenus[item.label] ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              )
            ) : null}
          </ListItemButton>
        </ListItem>

        {item.children && (
          <Collapse in={openMenus[item.label]} timeout='auto' unmountOnExit>
            <List component='div' disablePadding>
              {renderMenuItems(item.children, level + 1)}
            </List>
          </Collapse>
        )}
      </div>
    ))
  }

  return (
    <div className='sidebar'>
      <div className='user-section'>
        <Avatar
          src={user?.profile_image || '/profile.jpg'}
          sx={{ width: 64, height: 64, border: '2px solid #f16ca4' }}
        />
        <Typography variant='subtitle1' fontWeight={600} mt={1}>
          {user?.first_name + ' ' + user?.family_name || 'Jane Doe'}
        </Typography>
        <Typography variant='body2' color='textSecondary'>
          {user?.email || 'jane@test.com'}
        </Typography>
        <Button
          variant='outlined'
          startIcon={<Logout />}
          className='logout-button mt-6'
          onClick={logout}
        >
          Logout
        </Button>
      </div>

      <Divider />

      <List component='nav'>{renderMenuItems(CANDIDATE_SIDEBAR_MENU)}</List>
    </div>
  )
}

export default Sidebar
