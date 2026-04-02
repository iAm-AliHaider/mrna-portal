import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../supabaseClient';

export function useEmployeeLeaveQuotaSummary(
  employeeId,
  { startDate = null, endDate = null, month = null, year = null } = {}
) {
  const [data, setData]       = useState({quota: [], requests: []})
  const [isLoading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const fetchLeaveQuota = useCallback(async () => {
    if (!employeeId) return

    setLoading(true)
    setError(null)

    const { data: result, error: rpcError } = await supabase
      .rpc('get_employee_leave_summary', {
        p_employee_id: employeeId,
        p_start_date:  startDate,
        p_end_date:    endDate,
        p_month:       month,
        p_year:        year,
      })
      .single()

    if (rpcError) {
      setError(rpcError)
    } else {
      // result is { quota: [...], requests: [...] }
      setData(result ?? {quota: [], requests: []})
    }

    setLoading(false)
  }, [employeeId, startDate, endDate, month, year])

  useEffect(() => {
    fetchLeaveQuota()
  }, [fetchLeaveQuota])

  return {
    data,
    isLoading,
    error,
    refresh: fetchLeaveQuota,
  }
}
