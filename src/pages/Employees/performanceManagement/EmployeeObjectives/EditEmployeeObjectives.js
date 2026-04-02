import React from 'react'
import { useParams } from 'react-router-dom'
import { useEmployeeObjectiveById } from '../../../../utils/hooks/api/employeeObjectives'
import LoadingWrapper from '../../../../components/common/LoadingWrapper'
import EmployeeObjectivesForm from './EmployeeObjectivesForm'

const EditEmployeeObjective = () => {
  const { id } = useParams()
  const { objective, loading, error } = useEmployeeObjectiveById(id)

  return (
    <LoadingWrapper isLoading={loading} error={error}>
      <EmployeeObjectivesForm selectedObjective={objective} />
    </LoadingWrapper>
  )
}

export default EditEmployeeObjective
