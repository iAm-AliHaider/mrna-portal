// src/components/common/ApprovalStepper.jsx
import React from 'react'
import { Stepper, Step, StepLabel, Box } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import CancelIcon from '@mui/icons-material/Cancel'

const STATUS_ICONS = {
  approved: <CheckCircleIcon color='primary' />,
  pending: <HourglassEmptyIcon color='primary' />,
  rejected: <CancelIcon color='error' />
}

const OfferApprovalStepper = ({
  is_manager_approve = false,
  is_hod_approve = false,
  is_hr_manager_approve = false,
  status = 'pending'
}) => {
  const steps = [
    { label: 'Manager' },
    { label: 'HR Manager' },
    { label: 'Candidate' }
  ]

  const getManagerActualStatus = () => {
    if (status === 'pending_manager') {
      return 'pending'
    }
    if (status === 'rejected' && !is_manager_approve) {
      return 'rejected'
    }
    if (is_manager_approve) {
      return 'approved'
    }
  }
  const getHRManagerActualStatus = () => {
    if (status === 'pending_manager' || status === 'pending_hr_manager') {
      return 'pending'
    }

    if (
      !is_manager_approve &&
      status === 'rejected' &&
      !is_hr_manager_approve
    ) {
      return 'pending'
    }

    if (is_manager_approve && status === 'rejected' && !is_hr_manager_approve) {
      return 'rejected'
    }



    if (is_hr_manager_approve) {
      return 'approved'
    }
  }

  const getCandidateActualStatus = () => {
    if (status === 'accepted') return 'approved'
    if (status === 'declined') return 'rejected'
    return 'pending'
  }

  const FN_OBJECT ={
    Manager: getManagerActualStatus,
    'HR Manager': getHRManagerActualStatus,
    Candidate: getCandidateActualStatus,
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper alternativeLabel>
        {steps.map((step, idx) => {
          const status = FN_OBJECT[step.label]()
          if (status === undefined) return null
          return (
            <Step key={step.label} completed={status === 'approved'}>
              <StepLabel
                StepIconComponent={() => STATUS_ICONS[status]}
                sx={{
                  '& .MuiStepLabel-label': {
                    typography: 'body2'
                  }
                }}
              >
                {step.label}
              </StepLabel>
            </Step>
          )
        })}
      </Stepper>
    </Box>
  )
}

export default OfferApprovalStepper
