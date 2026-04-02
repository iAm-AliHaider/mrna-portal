import React from 'react'
import useUserData from '../../../utils/hooks/api/user'

const UserTableCell = ({ id, is_candidate = false }) => {
  const { data, loading } = useUserData(id, is_candidate)

  if (loading || !data) {
    return (
      <div className='flex items-center space-x-2'>
        <span className='text-gray-500'>Loading...</span>
      </div>
    )
  }

  const name = is_candidate
    ? `${data.first_name || ''} ${data.family_name || ''}`
    : `${data?.employee_code} - ${data.candidates?.first_name || ''} ${data.candidates?.second_name || ''} ${data.candidates?.third_name || ''} ${data.candidates?.forth_name || ''} ${data.candidates?.family_name || ''}`

  return (
    <div className='flex items-center space-x-2'>
      <span className='font-medium'>{name}</span>
    </div>
  )
}

export default UserTableCell
