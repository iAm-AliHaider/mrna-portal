import React from 'react'

import VacancyForm from '.'
import { useVacancyById } from '../../../../../../utils/hooks/api/vacancies'
import { useParams } from 'react-router-dom'

const EditVacancy = () => {
  const params = useParams()
  const vacancyId = params.id
  const { data, loading } = useVacancyById(vacancyId)

  if(loading) return <div>Loading...</div>

  return <VacancyForm data={data} />
}

export default EditVacancy
