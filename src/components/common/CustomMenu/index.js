import React, { useState } from 'react'
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'

const CustomMenu = ({ toggleComponent = null, items }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = event => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMenuItemClick = action => {
    action()
    handleClose()
  }

  return (
    <>
      <IconButton
        size='small'
        onClick={handleClick}
        aria-controls={open ? 'custom-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
      >
        {toggleComponent || <MoreVertIcon fontSize='small' />}
      </IconButton>

      <Menu
        id='custom-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            minWidth: '160px'
          }
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {items.map((item, index) => {
          return (
            <MenuItem
              key={index}
              onClick={(e) => { e.stopPropagation(); handleMenuItemClick(item.action) }}
              className={item.className || ''}
              sx={{
                color: item.danger ? 'error.main' : 'text.primary'
              }}
              disabled={item.disabled}
            >
              {item.icon && (
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: item.danger ? 'error.main' : 'inherit'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: item.danger ? 'error.main' : 'text.primary'
                }}
              />
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}

export default CustomMenu
