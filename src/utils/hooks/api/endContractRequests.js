import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../supabaseClient'
import toast from 'react-hot-toast'
import { useUser } from '../../../context/UserContext'

export function useEndContractRequests (
  page = 0,
  searchQuery = '',
  filters = {},
  perPage = 10
) {
  const [endContractData, setEndContractData] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState(null)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { user } = useUser()
  const employeeId = user?.id

  const fetchEndContracts = useCallback(
    async isCancelled => {
      if (!employeeId || isCancelled()) return
      try {
        setLoading(true)
        setError(null)

        const from = page * perPage
        const to = from + perPage - 1

        let query = supabase
          .from('end_contract_request')
          .select(
            '*, employee: employees!end_contract_request_employee_id_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*))',
            { count: 'exact' }
          )
           .eq('created_by', employeeId)

        //  let query = supabase
        //   .from('end_contract_request')
        //   .select(
        //     '*',
        //     { count: 'exact' }
        //   )
        //   .eq('is_deleted', false)
        //   .eq('created_by', employeeId)

        if (searchQuery) {
          query = query.or(
            `subject.ilike.%${searchQuery}%,end_contract.ilike.%${searchQuery}%`
          )
        }

        if (filters.status) {
          query = query.eq('status', filters.status)
        }

        if (filters.from_date) {
          query = query.gte('effected_date', filters.from_date)
        }

        if (filters.to_date) {
          query = query.lte('effected_date', filters.to_date)
        }

        query = query.order('created_at', { ascending: false }).range(from, to)

        const { data, error, count } = await query

        if (isCancelled()) return

        if (error) {
          setError(error)
          setEndContractData([])
          setTotalPages(0)
          setCount(0)
          return
        }

        setEndContractData(data || [])
        setCount(count || 0)
        setTotalPages(Math.ceil((count || 0) / perPage))
      } catch (err) {
        if (!isCancelled()) setError(err)
      } finally {
        if (!isCancelled()) setLoading(false)
      }
    },
    [page, searchQuery, filters, perPage, employeeId]
  )

  useEffect(() => {
    let isCancelled = false

    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchEndContracts(() => isCancelled)
      }
    }

    executeFetch()

    return () => {
      isCancelled = true
    }
  }, [fetchEndContracts, employeeId])

  const refetch = useCallback(() => {
    let isCancelled = false
    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchEndContracts(() => isCancelled)
      }
    }
    executeFetch()
  }, [fetchEndContracts, employeeId])

  return {
    endContractData,
    totalPages,
    error,
    count,
    loading,
    refetch
  }
}

export function useCreateEndContractRequest () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createEndContractRequest = useCallback(async payload => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: sbError } = await supabase
        .from('end_contract_request')
        .insert([payload])
        .select()
        .single()

      if (sbError) throw sbError

      toast.success('EndContract request created successfully!')
      return data
    } catch (err) {
      setError(err.message || err)
      toast.error(`Creation failed: ${err.message || err}`)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { createEndContractRequest, loading, error }
}

export function useEmployees () {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { user } = useUser()

  const branchId = user?.branch_id
  const organizationalUnitId = user?.organizational_unit_id

  useEffect(() => {

    const fetchCombined = async () => {
      const { data: rows, error: fetchError } = await supabase
        .from('employees')
        .select(
          `
          id,
          employee_code,
          company_id,
          employment_type_id,
          organizational_unit_id,
          candidates:candidates!employees_candidate_id_fkey(*)
        `
        )
        .eq('company_employee_status', 'active')
        .eq('user_status', 'active')
        .eq('is_deleted', false)
        .neq('id', user?.id)
        // .eq('branch_id', branchId)
        // .eq('organizational_unit_id', organizationalUnitId)
        // .order('id', { ascending: true })

      if (fetchError) {
        setError(fetchError)
        setLoading(false)
        return
      }

      setData(rows)
      setLoading(false)
    }

    fetchCombined()
  }, [branchId, organizationalUnitId])

  return { data, loading, error }
}


export function useEmploymentType() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmploymentType = useCallback(async (isCancelled) => {
    if (!isCancelled) {
      setLoading(true);
      setError(null);
    }

    try {
      const { data: rows, error: fetchError } = await supabase
        .from("employment_types")
        .select("*")

      if (fetchError) {
        throw fetchError;
      }

      if (!isCancelled) {
        setData(rows || []);
        setLoading(false);
      }
    } catch (err) {
      if (!isCancelled) {
        setError(err.message || err);
        setLoading(false);
        toast.error(`Error loading candidates: ${err.message || err}`);
      }
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    fetchEmploymentType(isCancelled);

    return () => {
      isCancelled = true;
    };
  }, [fetchEmploymentType]);

  return {
    data,
    loading,
    error,
    refetch: fetchEmploymentType,
  };
}
