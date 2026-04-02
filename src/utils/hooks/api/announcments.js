import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../../supabaseClient'
import { useUser } from '../../../context/UserContext'

export function useAnnouncmentsList(page = 0, pageSize = 10, searchQuery = '') {
  const [announcmentsData, setAnnouncmentsData] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [count, setCount] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const { user } = useUser()
  const created_by_id = user?.id

  const fetchAnnouncements = useCallback(async () => {
    if (!created_by_id) return

    setLoading(true)
    const from = page * pageSize
    const to = from + pageSize - 1

    try {
      let query = supabase
        .from('announcements')
        .select(`*, employee: employees!announcements_created_by_id_fkey!inner(*,  candidate: candidates!employees_candidate_id_fkey (*))`, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (searchQuery?.trim()) {
        query = query.or(
          `and(created_by_id.eq.${created_by_id},reference_no.ilike.%${searchQuery}%),and(created_by_id.eq.${created_by_id},title.ilike.%${searchQuery}%)`
        )
      } else {
        query = query.eq('created_by_id', created_by_id)
      }

      const { data, error: sbError, count: totalCount } = await query

      if (sbError) throw sbError

      setAnnouncmentsData(data || [])
      setCount(totalCount || 0)
      setTotalPages(Math.ceil((totalCount || 0) / pageSize))
      setError(null)
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
      toast.error(`Error loading announcements: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchQuery, created_by_id])

  useEffect(() => {
    let isCancelled = false
    if (!isCancelled) fetchAnnouncements()
    return () => {
      isCancelled = true
    }
  }, [fetchAnnouncements])

  return {
    announcmentsData,
    totalPages,
    count,
    error,
    loading,
    refetch: fetchAnnouncements,
  }
}
