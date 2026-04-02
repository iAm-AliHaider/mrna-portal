import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../supabaseClient'
import { toast } from 'react-hot-toast'
import { useUser } from '../../../context/UserContext'

export const useOffBoardingApprovalsRequests = ({
  page = 0,
  rowsPerPage = 10,
  searchQuery = '',
  status = '',
  employment_type_ids = []
}) => {
  const [offBoardingData, setOffBoardingData] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState(null)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useUser()
  const employeeId = user?.id

  const fetchOffBoardingRequests = useCallback(async () => {
    if (!employeeId || employment_type_ids.length === 0) return
    try {
      setLoading(true)
      setError(null)

      const from = page * rowsPerPage
      const to = from + rowsPerPage - 1

      const { data, error } = await supabase.rpc('get_offboarding_requests_filtered_by_first_name', {
        p_first_name: searchQuery || null,
        p_status: status || null,
        p_employment_type_ids: employment_type_ids ?? null,
        p_from: from,
        p_to: to,
        p_created_by:  null
      });
      
      if (error) {
        setError(error)
        setOffBoardingData([])
        setTotalPages(0)
        setCount(0)
        return
      }

      setOffBoardingData(data || [])
      setCount(count || 0)
      setTotalPages(Math.ceil((count || 0) / rowsPerPage))
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [
    page,
    rowsPerPage,
    searchQuery,
    status,
    employeeId,
    employment_type_ids.length
  ])

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      if (!mounted) return
      await fetchOffBoardingRequests()
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [fetchOffBoardingRequests])

  return {
    offBoardingData,
    totalPages,
    error,
    count,
    loading,
    refetch: fetchOffBoardingRequests
  }
}

export function useApproveRequest () {
  const [loading, setLoading] = useState(false)

  const approveRequest = useCallback(async id => {
    setLoading(true)
    try {
      const { data, error: reqErr } = await supabase
        .from('offboarding_requests')
        .update({ status: 'approved' })
        .eq('id', id)
        .select('employee_id')
        .single()
      if (reqErr) throw reqErr

      const { error: empErr } = await supabase
        .from('employees')
        .update({ is_off_boarding_approve: 'approved' })
        .eq('id', data.employee_id)

      if (empErr) {
        await supabase
          .from('offboarding_requests')
          .update({ status: 'pending' })
          .eq('id', id)
        throw empErr
      }

      toast.success('Off-boarding approved')
      return data
    } catch (err) {
      console.error(err)
      toast.error('Failed to approve off-boarding')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { approveRequest, loading }
}

export const useRejectRequest = () => {
  const [loading, setLoading] = useState(false)

  const rejectRequest = async id => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('offboarding_requests')
        .update({ status: 'rejected' })
        .eq('id', id)

      if (error) throw error

      toast.success('Off-boarding request rejected successfully')
    } catch (error) {
      console.error('Error deleting off-boarding request:', error)
      toast.error('Failed to delete off-boarding request')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { rejectRequest, loading }
}
