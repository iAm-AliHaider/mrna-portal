import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast' // or your preferred toast library
import { supabase } from '../../../supabaseClient'
import { useUser } from '../../../context/UserContext'

export function useMyMasterData (
  page = 0,
  searchQuery = '',
  filters = {},
  perPage = 10
) {
  const [documents, setDocuments] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState(null)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { user } = useUser()
  const employeeId = user?.id

  const fetchDocuments = useCallback(
    async isCancelled => {
      if (!employeeId || isCancelled()) return;
      try {
        setLoading(true)
        setError(null)
        
        const from = page * perPage
        const to = from + perPage - 1
        let query = supabase
          .from('master_data_request')
          .select('*', { count: 'exact' })
          .eq('is_deleted', false)
          .eq('created_by', employeeId)
        if (searchQuery) {
          query = query.or(
            `type.ilike.%${searchQuery}%`
          )
        }
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        query = query.order('id',{ ascending: false });

        query = query.range(from, to)

        const { data, error, count } = await query

        if (error) {
          setError(error)
          setDocuments([])
          setTotalPages(0)
          setCount(0)
          return
        }
        setDocuments(data || [])
        setCount(count || 0)
        setTotalPages(Math.ceil((count || 0) / perPage))
      } catch (err) {
        if (!isCancelled()) setError(err);
      } finally {
        if (!isCancelled()) setLoading(false);
      }
    },
    [page, searchQuery, filters, perPage, employeeId]
  )

  useEffect(() => {
    let isCancelled = false

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchDocuments(() => isCancelled)
      }
    }

    executeFetch()

    return () => {
      isCancelled = true
    }
  }, [fetchDocuments])

  const refetch = useCallback(() => {
    let isCancelled = false
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchDocuments(() => isCancelled)
      }
    }
    executeFetch()
  }, [fetchDocuments])

  return {
    documents,
    totalPages,
    error,
    count,
    loading,
    refetch
  }
}

// CREATE HOOK
export function useCreateMyMasterData () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createMyDocument = useCallback(async payload => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: sbError } = await supabase
        .from('master_data_request')
        .insert([payload])
        .select()
        .single()

      if (sbError) {
        throw sbError
      }

      toast.success('Master Data Request created successfully!')
      setLoading(false)
      return data
    } catch (err) {
      setError(err.message || err)
      toast.error(`Creation failed: ${err.message || err}`)
      setLoading(false)
      return null
    }
  }, [])

  return { createMyDocument, loading, error }
}