import React from 'react'
import { Box, Breadcrumbs, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

const CustomBreadcrumbs = ({ items = [], separator = '›' }) => {
  if (!items || items.length === 0) return null

  return (
    <Box className='breadcrumb-container width-container'>
      <Breadcrumbs separator={separator} aria-label='breadcrumb'>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          const content = item.title
            ? item.title
            : item.icon && (
                <item.icon key={index} fontSize='small' sx={{ mr: 0.5 }} />
              )

          if (isLast || !item.href) {
            return (
              <Typography key={`${item.title}-${index}`} color={isLast ? 'text.primary' : ''}>
                {content}
              </Typography>
            )
          }

          return (
            <Link
              key={`${item.title}-${index}`}
              underline='hover'
              color='inherit'
              to={item.href || '#'}
              className='breadcrumb-link flex items-center gap-1'
            >
              {content}
            </Link>
          )
        })}
      </Breadcrumbs>
    </Box>
  )
}

export default CustomBreadcrumbs
