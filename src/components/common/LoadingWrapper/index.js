import React from 'react'
import { CircularProgress } from '@mui/material'

const LoadingWrapper = ({ isLoading = false, children }) => {
  if (isLoading)
    return (
      <div className='w-full text-center mt-5'>
        <CircularProgress size={30} thickness={4} />
      </div>
    )

  return children
}

export default LoadingWrapper
