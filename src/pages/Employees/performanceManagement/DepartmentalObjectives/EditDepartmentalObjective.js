import React from 'react'
import { useParams } from 'react-router-dom'
import LoadingWrapper from '../../../../components/common/LoadingWrapper'
import DepartmentalObjectivesForm from './DepartmentalObjectivesForm'
import { useDepartmentalObjectiveById } from '../../../../utils/hooks/api/departmentalObjectives'

const EditDepartmentalObjective = () => {
  const { id } = useParams()
  const { objective, loading, error } = useDepartmentalObjectiveById(id)


  return (
    <LoadingWrapper isLoading={loading} error={error}>
      <DepartmentalObjectivesForm selectedObjective={objective} />
    </LoadingWrapper>
  )
}

export default EditDepartmentalObjective
