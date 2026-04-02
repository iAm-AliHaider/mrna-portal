import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../supabaseClient'
import toast from 'react-hot-toast'

export function useVacanciesList (page = 0, pageSize = 10, searchQuery = '') {
  const [vacancyData, setVacancyData] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [count, setCount] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const fetchVacancies = useCallback(async () => {
    setLoading(true)
    const from = page * pageSize
    const to = from + pageSize - 1
    try {
      const {
        data,
        error: sbError,
        count: totalCount
      } = await supabase
        .from('vacancy')
        .select(
          `
            *,
            organizational_units!vacancy_organizational_unit_id_fkey (
              id,
              name
            )
          `,
          { count: 'exact' }
        )
        .ilike('title', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .range(from, to)
      if (sbError) {
        throw sbError
      }
      setVacancyData(data || [])
      setCount(totalCount || 0)
      setTotalPages(Math.ceil((totalCount || 0) / pageSize))
      setError(null)
    } catch (err) {
      console.error('Error fetching vacancies:', err)
      setError(err.message || 'An unexpected error occurred')
      toast.error(`Error loading vacancies: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchQuery])

  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1)
  }, [])

  useEffect(() => {
    let isCancelled = false
    
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchVacancies()
      }
    }
    
    executeFetch()
    
    return () => {
      isCancelled = true
    }
  }, [fetchVacancies, refetchTrigger])

  return { vacancyData, totalPages, count, error, loading, refetch }
}

export function useVacancyById (vacancyId) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (vacancyId == null) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }

    let isCancelled = false
    setLoading(true)

    supabase
      .from('vacancy')
      .select(
        `
          *
        `
      )
      .eq('id', vacancyId)
      .single()
      .then(({ data: row, error: sbError }) => {
        if (sbError) {
          throw sbError
        }
        if (!isCancelled) {
          setData(row)
          setError(null)
        }
      })
      .catch(err => {
        console.error('Error fetching vacancy by ID:', err)
        if (!isCancelled) {
          setError(err.message || 'An unexpected error occurred')
          setData(null)
          toast.error(`Error loading vacancy: ${err.message || err}`)
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [vacancyId])

  return { data, error, loading }
}

export function useDeleteVacancy () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteVacancies = useCallback(async (ids) => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase.from("vacancy")

      if (Array.isArray(ids)) {
        query = query.delete().in("id", ids)
      } else {
        query = query.delete().eq("id", ids)
      }

      const { error: sbError, data } = await query

      if (sbError) {
        throw sbError
      }

      toast.success(
        Array.isArray(ids)
          ? `Deleted ${ids.length} vacancies successfully.`
          : "Vacancy deleted successfully."
      )
      setLoading(false)
      return data
    } catch (err) {
      if(err.code === "23503"){
        toast.error(`Cannot Delete applied Vacancies`)
        return null
      }
      setError(err.message || err)
      toast.error(`Deletion failed: ${err.message || err}`)
      setLoading(false)
      return null
    }
  }, [])

  return { deleteVacancies, loading, error }
}


export function useVacancyDuplicateCheck () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const checkDuplicate = useCallback(
    async ({
      title,
      organizational_unit_id,
      designation_id,
      caseInsensitive = false,
      excludeId,
      showToast = false
    }) => {
      setLoading(true)
      setError(null)

      try {
        const normalizedTitle = (title || '').trim()
        if (!normalizedTitle || organizational_unit_id == null || designation_id == null) {
          throw new Error('Missing required fields: title, organizational_unit_id, designation_id')
        }

        let query = supabase
          .from('vacancy')
          .select('id, title, organizational_unit_id, designation_id, created_at', { count: 'exact' })
          .eq('organizational_unit_id', organizational_unit_id)
          .eq('designation_id', designation_id)

        // Title match: exact or case-insensitive
        if (caseInsensitive) {
          // ilike without % means case-insensitive equality
          query = query.ilike('title', normalizedTitle)
        } else {
          query = query.eq('title', normalizedTitle)
        }

        // Exclude current row when editing
        if (excludeId != null) {
          query = query.neq('id', excludeId)
        }

        const { data, error: sbError } = await query
        if (sbError) throw sbError

        const exists = Array.isArray(data) && data.length > 0
        const record = exists ? data[0] : null

        if (exists && showToast) {
          toast.error('A vacancy with the same title, department, and designation already exists.')
        }

        return { exists, record }
      } catch (err) {
        const msg = err?.message || 'Failed to check duplicate vacancy'
        setError(msg)
        if (showToast) toast.error(msg)
        return { exists: false, record: null }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { checkDuplicate, loading, error }
}