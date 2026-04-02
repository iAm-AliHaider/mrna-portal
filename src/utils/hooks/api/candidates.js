import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../../supabaseClient'
import { useUser } from '../../../context/UserContext'

export function useInterviewScheduleList (
  page = 0,
  pageSize = 10,
  searchQuery = '',
  reportType = 'first_interview',
  interviewType = 'scheduled'
) {
  const [data, setData] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [count, setCount] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    const from = page * pageSize
    // const to = from + pageSize - 1
    const procedureName = getProcedureName(reportType, interviewType)
    try {
      const { data, error: sbError } = await supabase.rpc(
        procedureName,
        {
          page_limit: pageSize,
          page_offset: from,
          search_term: null
        },
        { count: 'exact' }
      )

      const totalCount = data?.count || 0

      if (sbError) throw sbError

      setData(data?.candidates || [])
      setCount(totalCount || 0)
      setTotalPages(Math.ceil((totalCount || 0) / pageSize))
      setError(null)
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
      toast.error(`Error loading candidates: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchQuery, reportType, interviewType])

  useEffect(() => {
    let isCancelled = false
    if (!isCancelled) fetchCandidates()
    return () => {
      isCancelled = true
    }
  }, [fetchCandidates])

  return {
    data,
    totalPages,
    count,
    error,
    loading,
    refetch: fetchCandidates
  }
}

export const useScheduleAnInterview = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()
  const employeeId = user?.id

  const scheduleInterview = async (interviewData, id) => {
    setLoading(true)
    try {
      if (id) {
        const payload = {
          ...interviewData,
          updated_by: employeeId
        }

        const { data, error: updateError } = await supabase
          .from('scheduled_interviews')
          .update(payload)
          .eq('id', id)
          .single()

        if (updateError) throw updateError

        toast.success('Interview updated successfully')
        return data
      }

      const payload = {
        ...interviewData,
        created_by: employeeId,
        updated_by: employeeId
      }
      const { data, error: sbError } = await supabase
        .from('scheduled_interviews')
        .insert(payload)
        .single()

      if (sbError) throw sbError

      toast.success('Interview scheduled successfully')
      return data
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
      toast.error(`Error scheduling interview: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  return {
    scheduleInterview,
    loading,
    error
  }
}

export const useCompanyEmployees = () => {
  const { user } = useUser()
  const companyId = user?.company_id
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getCompanyEmployees = async () => {
    if (!companyId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(
          `
          id,
          candidate_id,
          employee_code,
          candidates:candidates!employees_candidate_id_fkey(
            *
          )
        `
        )
        .eq('is_deleted', false)

      if (error) throw error

      setEmployees(data)
    } catch (err) {
      setError(err)
      console.error('Error fetching company employees:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCompanyEmployees()
  }, [companyId])

  return { employees, loading, error, getCompanyEmployees }
}

const getProcedureName = (reportType, interviewType) => {
  if (reportType === 'first_interview') {
    return interviewType === 'scheduled'
      ? 'get_scheduled_first_interviews'
      : 'get_unscheduled_first_interviews'
  } else if (reportType === 'second_interview') {
    return interviewType === 'scheduled'
      ? 'get_scheduled_second_interviews'
      : 'get_unscheduled_second_interviews'
  } else if (reportType === 'third_interview') {
    return interviewType === 'scheduled'
      ? 'get_scheduled_third_interviews'
      : 'get_unscheduled_third_interviews'
  }
  return ''
}


export function useGetInterviewScheduleList(page = 0, pageSize = 10, searchQuery = '') {
  const [data, setData] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    const from = page * pageSize
    const to = from + pageSize - 1

    try {
      let query = supabase
        .from('scheduled_interviews')
        .select(`
          *,
          candidate:candidates!scheduled_interviews_candidate_id_fkey(*, vacancy:vacancy (id, title)),
          interviewer_one:employees!scheduled_interviews_interviewer_id_fkey!inner(
            *,
            candidate:candidates!employees_candidate_id_fkey(*)
          ),
          second_interviewer:employees!scheduled_interviews_second_interviewer_id_fkey(
           *,
            candidate:candidates!employees_candidate_id_fkey(*)
          ),
          third_interviewer:employees!scheduled_interviews_third_interviewer_id_fkey(
            *,
             candidate:candidates!employees_candidate_id_fkey(*)
          )
        `, { count: 'exact' })
        .range(from, to)
        .order('updated_at', { ascending: false })

      if (searchQuery && searchQuery.trim() !== '') {
        query = query.ilike('candidate_number', `%${searchQuery.trim()}%`)
      }

      const { data, error: sbError, count: totalCount } = await query

      if (sbError) throw sbError

      setData(data || [])
      setCount(totalCount || 0)
      setTotalPages(Math.ceil((totalCount || 0) / pageSize))
      setError(null)
    } catch (err) {
      console.error(err)
      setError(err.message || 'An unexpected error occurred')
      toast.error(`Error loading interviews: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchQuery])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  return {
    data,
    totalPages,
    count,
    loading,
    error,
    refetch: fetchCandidates
  }
}

export const useUpdateCandidate = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()
  const employeeId = user?.id

  const updateCandidate = async (id, candidateData) => {
    setLoading(true)
    try {
      const payload = {
        ...candidateData,
        updated_by: employeeId
      }

      const { data, error: sbError } = await supabase
        .from('candidates')
        .update(payload)
        .eq('id', id)
        .single()

      if (sbError) throw sbError

      return data
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return {
    updateCandidate,
    loading,
    error
  }
}  