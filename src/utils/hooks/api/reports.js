import { useState, useEffect, useCallback } from 'react'
import { startOfDay, endOfDay } from 'date-fns'
import { supabase } from '../../../supabaseClient'

export default function useHiringReport (startDate, endDate) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('employees')
        .select(
          `*, 
              candidates:candidates!employees_candidate_id_fkey(*), 
              company_info:company_info!employees_company_id_fkey(*), 
              designations:designations!employees_designation_type_fkey(*), 
              organizational_units:organizational_units!employees_organizational_unit_fkey(*), 
              employment_types:employment_types!fk_employment_types(*),
              branches:branches!employees_branch_id_fkey(*)
              `
        )
        .gte('created_at', startOfDay(new Date(startDate)).toISOString())
        .lte('created_at', endOfDay(new Date(endDate)).toISOString())

      if (error) throw error

      setData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error }
}
