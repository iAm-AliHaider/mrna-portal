import React from 'react'
import { useParams } from 'react-router-dom'
import LoadingWrapper from '../../../../components/common/LoadingWrapper'
import OrganizationalObjectivesForm from './OrganizationalObjectivesForm'
import { useOrganizationalObjectiveById } from '../../../../utils/hooks/api/companyObjectives'

const EditOrganizationalObjective = () => {
  const { id } = useParams()
  const { objective, loading, error } = useOrganizationalObjectiveById(id)


  return (
    <LoadingWrapper isLoading={loading} error={error}>
      <OrganizationalObjectivesForm selectedObjective={objective} />
    </LoadingWrapper>
  )
}

export default EditOrganizationalObjective
