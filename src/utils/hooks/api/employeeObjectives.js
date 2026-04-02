import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useUser } from '../../../context/UserContext'
import { supabase } from '../../../supabaseClient'

export function useAddEmployeeObjective () {
  const { user } = useUser()
  const employeeId = user?.id

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addEmployeeObjective = useCallback(
    async objectiveData => {
      setLoading(true)
      setError(null)

      try {
        const { data: sumData, error } = await supabase.rpc('get_employee_total_objective_weight', {
          p_employee_id: employeeId
        })

        if (error) throw error

        if(sumData + objectiveData.weight > 100){
          toast.error('Total Objectives weight cannot exceed 100%')
          return null
        }

        const payload = {
          ...objectiveData,
          employee_id: employeeId,
          created_by: employeeId,
          updated_by: employeeId
        }

        const { data, error: insertError } = await supabase
          .from('employee_objectives')
          .insert([payload])
          .select('*')
          .single()

        if (insertError) throw insertError

        toast.success('Objective added successfully')
        return data
      } catch (err) {
        setError(err.message || 'An unexpected error occurred')
        toast.error(`Error adding objective: ${err.message || err}`)
      } finally {
        setLoading(false)
      }
    },
    [employeeId]
  )

  return {
    addEmployeeObjective,
    loading,
    error
  }
}

export function useEmployeeObjectivesList (
  page = 0,
  pageSize = 4,
  searchQuery = ''
) {
  const { user } = useUser()
  const employeeId = user?.id

  const [objectives, setObjectives] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [count, setCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchObjectives = useCallback(async () => {
    // compute zero-based offsets
    const from = page * pageSize
    const to = from + pageSize - 1

    if (!employeeId) {
      setObjectives([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('employee_objectives')
        .select('*', { count: 'exact' })
        .eq('employee_id', employeeId)
        .eq('is_deleted', false)

      if (searchQuery) {
        query = query.ilike('objective_title', `%${searchQuery}%`)
      }

      const {
        data,
        error: fetchError,
        count
      } = await query.order('created_at', { ascending: false }).range(from, to)

      if (fetchError) throw fetchError

      setObjectives(data ?? [])
      setCount(count ?? 0)
      setTotalPages(Math.ceil(count / pageSize))
    } catch (err) {
      console.error('Error fetching objectives:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [employeeId, page, pageSize, searchQuery])

  useEffect(() => {
    fetchObjectives()
  }, [fetchObjectives])

  return {
    objectives,
    loading,
    error,
    count,
    totalPages,
    refetch: fetchObjectives
  }
}

export function useDeleteEmployeeObjective () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteObjectives = useCallback(async ids => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase.from('employee_objectives')

      if (Array.isArray(ids)) {
        query = query.update({ is_deleted: true }).in('id', ids)
      } else {
        query = query.update({ is_deleted: true }).eq('id', ids)
      }

      const { error: sbError, data } = await query

      if (sbError) throw sbError

      toast.success(
        Array.isArray(ids)
          ? `Deleted ${ids.length} objectives successfully.`
          : 'Objective deleted successfully.'
      )
      return data
    } catch (err) {
      setError(err.message || err)
      toast.error(`Deletion failed: ${err.message || err}`)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    deleteObjectives,
    loading,
    error
  }
}

export function useEmployeeObjectiveById (objectiveId) {
  const [objective, setObjective] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // reset if no ID
    if (objectiveId == null) {
      setObjective(null)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const { data, error: sbError } = await supabase
          .from('employee_objectives')
          .select('*')
          .eq('id', objectiveId)
          .single()

        if (sbError) throw sbError

        setObjective(data)
      } catch (err) {
        console.error('Error fetching objective by ID:', err)
        setError(err.message || 'An unexpected error occurred')
        setObjective(null)
        toast.error(`Error loading objective: ${err.message || err}`)
      } finally {
        setLoading(false)
      }
    })()
  }, [objectiveId])

  return { objective, loading, error }
}

export function useUpdateEmployeeObjective () {
  const { user } = useUser()
  const employeeId = user?.id

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateEmployeeObjective = useCallback(
    async (id, objectiveData) => {
      setLoading(true)
      setError(null)

      try {
        const payload = {
          ...objectiveData,
          updated_by: employeeId
        }

        const { data, error: updateError } = await supabase
          .from('employee_objectives')
          .update(payload)
          .eq('id', id)
          .select('*')
          .single()

        if (updateError) throw updateError

        toast.success('Objective updated successfully')
        return data
      } catch (err) {
        setError(err.message || 'An unexpected error occurred')
        toast.error(`Error updating objective: ${err.message || err}`)
        return null
      } finally {
        setLoading(false)
      }
    },
    [employeeId]
  )

  return {
    updateEmployeeObjective,
    loading,
    error
  }
}
