import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useUser } from '../../../context/UserContext'
import { supabase } from '../../../supabaseClient'
import { format } from 'date-fns'
import { ROLES } from '../../constants'
import { transactionEmailSender } from '../../../utils/helper'

export function useCreateApprasail () {
  const { user } = useUser()
  const employeeId = user?.id

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createAppraisal = useCallback(
    async objectiveData => {
      setLoading(true)
      setError(null)

      try {
        const { employee_id } = objectiveData

        const { data: existingAppraisal, error: checkError } = await supabase
          .from('appraisals')
          .select('id')
          .eq('employee_id', employee_id)
          .eq('status', 'pending')

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }

        if (existingAppraisal?.length > 0) {
          throw new Error('Employee already has an pending appraisal')
        }

        const payload = {
          ...objectiveData,
          created_by: employeeId,
          updated_by: employeeId
        }

        const { data, error: insertError } = await supabase
          .from('appraisals')
          .insert([payload])
          .select('*')
          .single()

        if (insertError) throw insertError

        toast.success('Appraisal added successfully')
        return data
      } catch (err) {
        setError(err.message || 'An unexpected error occurred')
        toast.error(`Error adding appraisal: ${err.message || err}`)
      } finally {
        setLoading(false)
      }
    },
    [employeeId]
  )

  return {
    createAppraisal,
    loading,
    error
  }
}

export function useAppraisalsList (page = 0, pageSize = 4, employeeId = '') {
  const { user } = useUser()
  const { role, organizational_unit_id } = user || {}

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [count, setCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchAppraisals = useCallback(async () => {
    const from = page * pageSize
    const to = from + pageSize - 1

    if (!role || !organizational_unit_id) {
      setData([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('appraisals')
        .select(
          `
          *,
          employee:employees!appraisals_employee_id_fkey(
            *,
            candidates(*)
          ),
          reviewer:employees!appraisals_reviewer_id_fkey(
            *,
            candidates(*)
          )
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })

      if (employeeId) {
        query = query.eq('employee_id', employeeId)
      }

      if (role === 'manager') {
        query = query.eq('organizational_unit_id', organizational_unit_id)
      }

      const {
        data,
        error: fetchError,
        count
      } = await query.order('created_at', { ascending: false }).range(from, to)

      if (fetchError) throw fetchError

      setData(data ?? [])
      setCount(count ?? 0)
      setTotalPages(Math.ceil(count / pageSize))
    } catch (err) {
      toast.error('Error fetching appraisals')
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [role, organizational_unit_id, page, pageSize, employeeId])

  useEffect(() => {
    fetchAppraisals()
  }, [fetchAppraisals])

  return {
    data,
    loading,
    error,
    count,
    totalPages,
    refetch: fetchAppraisals
  }
}

export function useCancelAppraisal () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cancel = useCallback(async (appraisalId, comment = '') => {
    setLoading(true)
    setError(null)

    try {
      const updates = { status: 'cancelled' }
      if (comment) updates.comments = comment

      const { data, error: sbError } = await supabase
        .from('appraisals')
        .update(updates)
        .eq('id', appraisalId)
        .select('*')
        .single()

      if (sbError) throw sbError

      toast.success('Appraisal cancelled successfully')
      return data
    } catch (err) {
      console.error('Error cancelling appraisal:', err)
      setError(err.message || err)
      toast.error(`Failed to cancel appraisal`)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    cancel,
    loading,
    error
  }
}

export function useAllEmployees () {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { user } = useUser()
  const { role, organizational_unit_id } = user || {}

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!role || !organizational_unit_id) {
      setEmployees([])
      return
    }

    try {
      let query = supabase
        .from('employees')
        .select('*, candidates(*), employment_types(*)')
        .order('created_at', {
          ascending: false
        })

      if (role === ROLES.MANAGER) {
        query = query.eq('organizational_unit_id', organizational_unit_id)
        query = query.eq('role_columns->roles', '["employee"]')
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setEmployees(data ?? [])
    } catch (err) {
      toast.error('Error fetching employees:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [role, organizational_unit_id])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  return {
    employees,
    loading,
    error
  }
}

export function useCompanyObjectives () {
  const [objectives, setObjectives] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const today = format(new Date(), 'yyyy-MM-dd')
  useEffect(() => {
    setLoading(true)

    supabase
      .from('organizational_objectives')
      .select('*')
      .eq('is_deleted', false)
      // .lte('start_period', today)
      // .gte('end_period', today)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError(error)
          toast.error('Failed to load company objectives')
        } else {
          setObjectives(data || [])
        }
      })
      .finally(() => setLoading(false))
  }, [today])

  return { objectives, loading, error }
}

export function useEmployeeObjectives (appraisalId) {
  const [appraisal, setAppraisal] = useState(null)
  const [objectives, setObjectives] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!appraisalId) return

    setLoading(true)
    setError(null)

    const currentYear = new Date().getFullYear()
    const startOfYear = `${currentYear}-01-01`
    const endOfYear = `${currentYear}-12-31`

    ;(async () => {
      try {

        const { data: appData, error: appError } = await supabase
          .from('appraisals')
          .select('*, employees!appraisals_employee_id_fkey(*)')
          .eq('id', appraisalId)
          .single()

        if (appError) throw appError
        setAppraisal(appData)

        const { employee_id } = appData || {}

        const { data: objData, error: objError } = await supabase
          .from('employee_objectives')
          .select('*')
          .eq('employee_id', employee_id)
          .eq('is_deleted', false)
          .gte('end_period', startOfYear)
          .lte('end_period', endOfYear)

        if (objError) throw objError
        setObjectives(objData ?? [])
      } catch (err) {
        console.error('Error loading employee appraisal & objectives:', err)
        setError(err)
        toast.error('Failed to load appraisal or objectives')
      } finally {
        setLoading(false)
      }
    })()
  }, [appraisalId])

  return {
    appraisal,
    objectives,
    loading,
    error
  }
}

export function useSubmitAppraisal () {
  const { user } = useUser()
  const reviewerId = user?.id

  const [loading, setLoading] = useState(false)

  const submit = useCallback(
    async (id, assessment, comments, appraisal_method, appraisal_percentage, appraisal_amount, work_flow) => {
      if (!reviewerId) {
        toast.error('Missing context')
        return
      }
      setLoading(true)
      try {
        const totalWeight = assessment.reduce((sum, o) => sum + o.weight, 0)
        const weightedScore = assessment.reduce((sum, o) => {
          const score = Number(o.reviewer_score || 0)
          return sum + (score * o.weight) / o.score
        }, 0)

        const totalScore =
          totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0
        const payload = {
          updated_by: reviewerId,
          reviewer_id: reviewerId,
          assessment,
          score: totalScore,
          comments,
          status: 'reviewed',
          appraisal_method: appraisal_method,
          appraisal_percentage: appraisal_percentage || null,
          appraisal_amount: appraisal_amount || null,
          status_workflow: work_flow
        }

        const { error } = await supabase
          .from('appraisals')
          .update(payload)
          .eq('id', id)
          .select('*')
          .single()


        await transactionEmailSender(user, payload, "New Appraisal Request", `New Appraisal Request`);
          

        if (error) throw error

        toast.success('Appraisal review submitted')
      } catch (err) {
        toast.error(`Submit failed: ${err.message || err}`)
      } finally {
        setLoading(false)
      }
    },
    [reviewerId]
  )

  return { submit, loading }
}

export function useGetAppraisalsById (appraisalId) {
  const [appraisal, setAppraisal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAppraisal = useCallback(async () => {
    if (!appraisalId) {
      setAppraisal(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('appraisals')
        .select(
          `
          *,
          employee:employees!appraisals_employee_id_fkey(
            *,
            candidates(*)
          ),
          reviewer:employees!appraisals_reviewer_id_fkey(
            *,
            candidates(*)
          )
        `
        )
        .eq('id', appraisalId)
        .single()

      const { data, error: fetchError } = await query.order('created_at', {
        ascending: false
      })

      if (fetchError) throw fetchError

      setAppraisal(data ?? [])
    } catch (err) {
      console.error('Error fetching appraisal:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [appraisalId])

  useEffect(() => {
    fetchAppraisal()
  }, [fetchAppraisal])

  return {
    appraisal,
    loading,
    error
  }
}

export function useGetMyAppraisals (page = 0, pageSize = 4, searchQuery = '') {
  const [appraisals, setAppraisals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [count, setCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const { user } = useUser()
  const employeeId = user?.id

  const fetchAppraisal = useCallback(async () => {
    if (!employeeId) {
      setAppraisals([])
      return
    }

    setLoading(true)
    setError(null)

    const from = page * pageSize
    const to = from + pageSize - 1

    try {
      let query = supabase
        .from('appraisals')
        .select(
          `*,
          employee:employees!appraisals_employee_id_fkey!inner (
            id,
            candidates(id, first_name, family_name, full_name)
          ),
          reviewer:employees!appraisals_reviewer_id_fkey(
            id,
            candidates(id, first_name, family_name, full_name)
          )`,
          { count: 'exact' }
        )
        .eq('employee_id', employeeId)
        .range(from, to)

        if (searchQuery?.trim()) {
          // Use `or` filter across exposed joined fields
          query = query.or(
            `employee.candidates.first_name.ilike.%${searchQuery}%,` 
          )
        }

      const { data, error: fetchError } = await query.order('created_at', {
        ascending: false
      })

      if (fetchError) throw fetchError

      setAppraisals(data ?? [])
      setCount(count ?? 0)
      setTotalPages(Math.ceil(count / pageSize))
    } catch (err) {
      console.error('Error fetching appraisal:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [employeeId, page, pageSize, searchQuery, count])

  useEffect(() => {
    fetchAppraisal()
  }, [fetchAppraisal])

  return {
    appraisals,
    loading,
    error,
    totalPages,
    count
  }
}

export function useSubmitAppraisalResponse () {
  const { user } = useUser()
  const empId = user?.id

  const [loading, setLoading] = useState(false)

  const submit = useCallback(
    async (id, response) => {
      if (!empId) {
        toast.error('Missing context')
        return
      }
      setLoading(true)
      try {
        const payload = {
          updated_by: empId,
          response
        }

        const { error } = await supabase
          .from('appraisals')
          .update(payload)
          .eq('id', id)
          .select('*')
          .single()

        if (error) throw error

        toast.success('Appraisal response submitted')
      } catch (err) {
        toast.error(`Submit failed: ${err.message || err}`)
      } finally {
        setLoading(false)
      }
    },
    [empId]
  )

  return { submit, loading }
}
