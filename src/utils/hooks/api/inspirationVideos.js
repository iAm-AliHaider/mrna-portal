import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../supabaseClient'
import toast from 'react-hot-toast'

// Fetch photos with pagination
export function useInspirationVideos (page = 1, perPage = 12) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchInspirationVideos = useCallback(
    async isCancelled => {
      if (!isCancelled) {
        setLoading(true)
        setError(null)
      }
      try {
        // Calculate range for pagination
        const from = (page - 1) * perPage
        const to = from + perPage - 1

        // Get paginated data
        const {
          data: rows,
          error: fetchError,
          count
        } = await supabase
          .from('inspiration_videos')
          .select('*', { count: 'exact' })

          .order('created_at', { ascending: false })
          .range(from, to)

        if (fetchError) throw fetchError

        if (!isCancelled) {
          setData(rows || [])
          setTotalCount(count || 0)
          setLoading(false)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || err)
          setLoading(false)
          toast.error(`Error loading photos: ${err.message || err}`)
        }
      }
    },
    [page, perPage]
  )

  useEffect(() => {
    let isCancelled = false
    fetchInspirationVideos(isCancelled)
    return () => {
      isCancelled = true
    }
  }, [fetchInspirationVideos])

  return {
    data,
    loading,
    error,
    totalCount,
    refetch: fetchInspirationVideos
  }
}

// Create new Video
export function useCreateInspirationVideos () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createVideo = useCallback(async videoData => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: insertError } = await supabase
        .from('inspiration_videos')
        .insert([videoData])
        .select()
        .single()
      if (insertError) throw insertError
      setLoading(false)
      return data
    } catch (err) {
      setError(err.message || err)
      setLoading(false)
      toast.error(`Error creating videos: ${err.message || err}`)
      throw err
    }
  }, [])

  return { createVideo, loading, error }
}

// Delete photo (soft delete)
export function useDeleteVideo () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteVideo = useCallback(async id => {
    setLoading(true)
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('inspiration_videos')
        .delete()
        .eq('id', id)
      if (deleteError) throw deleteError
      setLoading(false)
      return id
    } catch (err) {
      setError(err.message || err)
      setLoading(false)
      toast.error(`Error deleting photo: ${err.message || err}`)
      throw err
    }
  }, [])

  return { deleteVideo, loading, error }
}
