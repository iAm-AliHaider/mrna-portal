import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

const useUserData = (userId, is_candidate = false) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      const { table, select } = is_candidate
        ? TABLES_DATA['candidate']
        : TABLES_DATA['employee']
      try {
        const { data: empId, error } = await supabase
          .from(table)
          .select(select)
          .eq('id', userId)
          .single()

        if (error) throw error
        setData(empId)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, is_candidate])

  return {
    data,
    loading,
    error
  }
}

export default useUserData

const TABLES_DATA = {
  candidate: {
    table: 'candidates',
    select: '*',
    single: true
  },
  employee: {
    table: 'employees',
    select: '*, candidates:candidates!employees_candidate_id_fkey(*),organizational_units:organizational_units!employees_organizational_unit_fkey(*),employement_type:employment_types!fk_employment_types(*),designation:designations!employees_designation_type_fkey(*)',
    single: true
  }
}
