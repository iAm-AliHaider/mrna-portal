import React, { useState, useEffect } from 'react'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import InterviewsList from './list'
import ScheduledInterviews from '../../Employees/recruitment'



const INTERVIES_PAGE_TYPE = [
  { label: 'Interviews List', value: 'interviews-list' },
  {
    label: 'Scheduled Interviews',
    value: 'scheduled-interviews'
  }
]

const RecruitmentPage = () => {
  const [pageType, setPageType] = useState('interviews-list')




  const handleToggleChange = (_, newType) => {
    if (newType) {
      setPageType(newType)
    }
  }

  // Render content based on pageType
  const renderPageContent = () => {
    if (pageType === 'interviews-list') {
      return <InterviewsList />
    }
    if (pageType === 'scheduled-interviews') {
      return <ScheduledInterviews />
    }
    return null
  }

  return (
    <React.Fragment>
      <div className='flex justify-end'>
        <ToggleButtonGroup
          value={pageType}
          exclusive
          onChange={handleToggleChange}
          size='small'
        >
          {INTERVIES_PAGE_TYPE.map(tab => (
            <ToggleButton key={tab.value} value={tab.value}>
              {tab.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>
      <div className='mt-4'>
        {renderPageContent()}
      </div>
    </React.Fragment>
  )
}

export default RecruitmentPage
