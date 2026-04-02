import { useState, useEffect } from 'react'
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

export function useBranches(companyId) {
  const [branches, setBranches] = useState([])
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // if (!companyId) return
    setLoading(true)
    supabase
      .from('branches')
      .select('*')
      .eq('is_deleted', false)
      .then(({ data, error }) => {
        if (error) {
          setError(error)
          toast.error(`Error fetching Branch data: ${error.message}`)
        } else {
          setBranches(data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return { branches, loading, error }
}
