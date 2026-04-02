import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import { useUser } from '../../../context/UserContext'

export const useOvertimeRequestsList = (page = 0, perPage = 10, searchTerm = '') => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalCount, setTotalCount] = useState(0)
  const { user } = useUser()
  const companyId = user?.company_id

  const fetchOvertimeRequests = async () => {
    if (!companyId) {
      return
    }
    
    setLoading(true)
    setError(null)

    try {
      
      // Get overtime requests with employee and candidate information
      let query = supabase
        .from('overtime_request')
        .select(`*`, { count: 'exact' })
        .eq('is_deleted', false)
        .eq('employee_id', user?.id)
        .order('created_at', { ascending: false })

      // Add search filter if searchTerm is provided
      if (searchTerm) {
        query = query.or(`status.ilike.%${searchTerm}%`)
      }

      // Pagination
      const from = page * perPage
      const to = from + perPage - 1
      query = query.range(from, to)

      const { data: overtimeData, error: dataError, count } = await query

      if (dataError) {
        console.error('Data error:', dataError)
        throw dataError
      }


      setData(overtimeData || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Error fetching overtime requests:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOvertimeRequests()
  }, [companyId, page, perPage, searchTerm])

  const refetch = () => {
    fetchOvertimeRequests()
  }

  return {
    overtimeRequestsData: data,
    totalCount,
    loading,
    error,
    refetch
  }
}

export const useCreateOvertimeRequest = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
    const { user } = useUser()


  const createOvertimeRequest = async (payload) => {
    setLoading(true)
    setError(null)

    
    try {
      const { data, error: createError } = await supabase
        .from('overtime_request')
        .insert(payload)
        .select()
        .single()

      if (createError) {
        throw createError
      }

      return { success: true, data }
    } catch (err) {
      console.error('Error creating overtime request:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    createOvertimeRequest,
    loading,
    error
  }
} 