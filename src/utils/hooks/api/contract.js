import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'
import { useUser } from '../../../context/UserContext'
import toast from 'react-hot-toast'

export const useOfferLetter = () => {
  const { user } = useUser()
  const [offer, setOffer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOffer = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('offer_requests')
        .select('*')
        .eq('candidate_id', user.id)
        .in('status', ['accepted', 'declined', 'approved'])
        .single()

      if (error) throw error

      setOffer(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch offer letter.')
      setOffer(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchOffer()
  }, [fetchOffer])

  return { offer, loading, error, refetch: fetchOffer }
}

export const useAcceptOffer = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()

  const acceptOffer = useCallback(async (offerId, values) => {
    if (!offerId) {
      toast.error('Missing offer ID')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from('offer_requests')
        .update({
          ...values,
          status: 'accepted'
        })
        .eq('id', offerId)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      toast.success('Offer accepted successfully')
      return data
    } catch (err) {
      console.error('Error accepting offer:', err)
      toast.error('Failed to accept offer')
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    acceptOffer,
    loading,
    error
  }
}

export const useRefuseOffer = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refuseOffer = useCallback(async (offerId, rejectionReason = '') => {
    if (!offerId) {
      toast.error('Missing offer ID')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from('offer_requests')
        .update({
          status: 'declined',
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', offerId)
        .select()
        .single()

      if (updateError) throw updateError

      toast.success('Offer Refused successfully')
      return data
    } catch (err) {
      console.error('Error refusing offer:', err)
      toast.error('Failed to refusing offer')
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    refuseOffer,
    loading,
    error
  }
}

export const useCandidates = () => {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*, designation:designations(*)')
        .eq('offer_letter', 'accepted')
        .eq('contract', 'not_generated')
        .eq('is_deleted', false)
        .eq('is_employee', false)

      if (error) throw error
      setCandidates(data || [])
    } catch (err) {
      console.error('Error fetching candidates:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  return {
    candidates,
    loading,
    error,
    refetch: fetchCandidates
  }
}

export const useOfferRequestByCandidateId = () => {
  const [offerRequest, setOfferRequest] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOfferRequestById = useCallback(async (id) => {
    if (!id) {
      toast.error('Offer request ID is missing')
      return
    }

    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('offer_requests')
      .select('*')
      .eq('candidate_id', id)
      .eq('is_deleted', false)
      .eq('status', 'accepted')
      .single()

    if (error) {
      setError(error.message)
      toast.error('Failed to load offer request')
    } else if(data) {
      setOfferRequest(data)
    } else {
      toast.error('Candidate has not accepted offer letter.')
      setOfferRequest(null)
    }

    setLoading(false)
  }, [])


  return {
    offerRequest,
    loading,
    error,
    fetchOfferRequestById
  }
}

export const useCreateJobContract = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createJobContract = useCallback(async (payload) => {
    setLoading(true)
    setError(null)

    try {
      if (!payload?.candidate_id) {
        toast.error('Candidate ID is required')
        return null
      }

      const { data: existing, error: checkError } = await supabase
        .from('job_contracts')
        .select('id')
        .eq('candidate_id', payload.candidate_id)
        .eq('is_deleted', false)
        .maybeSingle()

      if (checkError) {
        throw checkError
      }

      if (existing) {
        toast.error('An active job contract already exists for this candidate')
        return null
      }

      const { data, error: insertError } = await supabase
        .from('job_contracts')
        .insert(payload)
        .select()
        .single()

      if (insertError) throw insertError

      toast.success('Job contract created successfully')
      return data
    } catch (err) {
      toast.error('Failed to create job contract')
      console.error('Create Job Contract Error:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createJobContract,
    loading,
    error
  }
}

export function useContractsList ({ page, perPage, status, searchQuery }) {
  const [data, setData] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
      .from('job_contracts')
      .select('*, candidate:fk_candidate(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * perPage, (page + 1) * perPage - 1)
      .eq('is_deleted', false)

      if (status) {
        query = query.eq('status', status)
      }
      if (searchQuery) {
        query = query
          .ilike('candidate.full_name', `%${searchQuery}%`)
          .not('candidate', 'is', null)
          .neq('candidate.full_name', '')
      }

      const { data: rows, error, count } = await query

      if (error) {
        toast.error('Failed to load approvals')
        console.error('Supabase fetch error:', error)
      } else {
        setData(rows || [])
        setTotalPages(Math.ceil((count || 0) / perPage))
      }
    } catch (err) {
      toast.error('Unexpected error occurred')
      console.error('Unexpected fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, status, searchQuery])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    totalPages,
    loading,
    refetch: fetchData
  }
}

export const useContract = () => {
  const { user } = useUser()
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchContract = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('job_contracts')
        .select('*, hr_manager:fk_created_by(*,candidate:employees_candidate_id_fkey(*)),candidate:fk_candidate(*)')
        .eq('candidate_id', user.id)
        .in('status', ['accepted', 'declined', 'pending'])
        .single()

      if (error) throw error

      setContract(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch contract letter.')
      setContract(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchContract()
  }, [fetchContract])

  return { contract, loading, error, refetch: fetchContract }
}

export const useAcceptContract = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const acceptContract = useCallback(async (id, values) => {
    if (!id) {
      toast.error('Missing offer ID')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from('job_contracts')
        .update({
          ...values,
          status: 'accepted'
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      toast.success('Offer accepted successfully')
      return data
    } catch (err) {
      console.error('Error accepting offer:', err)
      toast.error('Failed to accept offer')
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    acceptContract,
    loading,
    error
  }
}

export const useRefuseContract = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refuseContract = useCallback(async (id, rejectionReason = '') => {
    if (!id) {
      toast.error('Missing contract ID')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from('job_contracts')
        .update({
          status: 'declined',
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      toast.success('Contract Refused successfully')
      return data
    } catch (err) {
      console.error('Error refusing contract:', err)
      toast.error('Failed to refusing contract')
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    refuseContract,
    loading,
    error
  }
}