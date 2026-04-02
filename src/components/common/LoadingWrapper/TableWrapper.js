import React from 'react'
import { CircularProgress } from '@mui/material'

const TableLoadingWrapper = ({ isLoading = false, children }) => {
  if (isLoading) {
    return (
      <tr>
        <td colSpan='100%' className='py-8 text-center'>
          <CircularProgress size={30} thickness={4} />
        </td>
      </tr>
    )
  }

  return <>{children}</>
}

export default TableLoadingWrapper
