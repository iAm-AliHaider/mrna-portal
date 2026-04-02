import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../../supabaseClient'
import { useUser } from '../../../context/UserContext'

export function useHolidayDefinitionsList(page = 0, pageSize = 10, searchQuery = '') {
  const [holidayData, setHolidayData] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [count, setCount] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const { user } = useUser()
  const created_by_id = user?.id

  const fetchHolidayDefinitions = useCallback(async () => {
    if (!created_by_id) return

    setLoading(true)
    const from = page * pageSize
    const to = from + pageSize - 1

    try {
      let query = supabase
        .from('holiday_definitions')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(from, to)

        if (searchQuery?.trim()) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

      const { data, error: sbError, count: totalCount } = await query

      if (sbError) throw sbError

      setHolidayData(data || [])
      setCount(totalCount || 0)
      setTotalPages(Math.ceil((totalCount || 0) / pageSize))
      setError(null)
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
      toast.error(`Error loading holiday definitions: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchQuery, created_by_id])

  useEffect(() => {
    let isCancelled = false
    if (!isCancelled) fetchHolidayDefinitions()
    return () => {
      isCancelled = true
    }
  }, [fetchHolidayDefinitions])

  return {
    holidayData,
    totalPages,
    count,
    error,
    loading,
    refetch: fetchHolidayDefinitions,
  }
}

export function useCreateHolidayDefinition() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()

  const createHolidayDefinition = useCallback(async (holidayData) => {
    if (!user?.id) {
      toast.error('User not authenticated')
      return { success: false }
    }

    setLoading(true)
    setError(null)

    try {
      const holidayPayload = {
        name: holidayData.holidayName,
        holiday_date: holidayData.holidayDate,
        holiday_year: parseInt(holidayData.holidayYear),
        religion: holidayData.religion,
        repeatable: holidayData.repeatable || false,
        notes: holidayData.notes || '',
        company_id: 1, // Static company ID as requested
        created_by: user.id,
        updated_by: user.id,
        is_deleted: false
      }

      const { data, error: sbError } = await supabase
        .from('holiday_definitions')
        .insert([holidayPayload])
        .select()

      if (sbError) throw sbError

      toast.success('Holiday definition created successfully')
      return { success: true, data }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      toast.error(`Error creating holiday definition: ${errorMessage}`)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  return {
    createHolidayDefinition,
    loading,
    error
  }
}

export function useUpdateHolidayDefinition() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()

  const updateHolidayDefinition = useCallback(async (id, holidayData) => {
    if (!user?.id) {
      toast.error('User not authenticated')
      return { success: false }
    }

    setLoading(true)
    setError(null)

    try {
      const holidayPayload = {
        name: holidayData.holidayName,
        holiday_date: holidayData.holidayDate,
        holiday_year: parseInt(holidayData.holidayYear),
        religion: holidayData.religion,
        repeatable: holidayData.repeatable || false,
        notes: holidayData.notes || '',
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }

      const { data, error: sbError } = await supabase
        .from('holiday_definitions')
        .update(holidayPayload)
        .eq('id', id)
        .select()

      if (sbError) throw sbError

      toast.success('Holiday definition updated successfully')
      return { success: true, data }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      toast.error(`Error updating holiday definition: ${errorMessage}`)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  return {
    updateHolidayDefinition,
    loading,
    error
  }
}

export function useDeleteHolidayDefinitions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()

  const deleteHolidayDefinitions = useCallback(async (ids) => {
    if (!user?.id) {
      toast.error('User not authenticated')
      return { success: false }
    }

    if (!ids || ids.length === 0) {
      toast.error('No holiday definitions selected for deletion')
      return { success: false }
    }

    setLoading(true)
    setError(null)

    try {
      // Soft delete by setting is_deleted to true
      const { error: sbError } = await supabase
        .from('holiday_definitions')
        .update({ 
          is_deleted: true, 
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .in('id', ids)

      if (sbError) throw sbError

      toast.success(`${ids.length} holiday definition(s) deleted successfully`)
      return { success: true }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      toast.error(`Error deleting holiday definitions: ${errorMessage}`)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  return {
    deleteHolidayDefinitions,
    loading,
    error
  }
}

export function useHolidayDefinitionById(id) {
  const [holidayData, setHolidayData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHolidayDefinition = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: sbError } = await supabase
        .from('holiday_definitions')
        .select('*')
        .eq('id', id)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .single()

      if (sbError) throw sbError

      setHolidayData(data)
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      toast.error(`Error loading holiday definition: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    let isCancelled = false
    if (!isCancelled) fetchHolidayDefinition()
    return () => {
      isCancelled = true
    }
  }, [fetchHolidayDefinition])

  return {
    holidayData,
    loading,
    error,
    refetch: fetchHolidayDefinition
  }
} 