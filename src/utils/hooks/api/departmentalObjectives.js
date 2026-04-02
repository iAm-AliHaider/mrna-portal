import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useUser } from '../../../context/UserContext'
import { supabase } from '../../../supabaseClient'



export function useAddDepartmentalObjective() {
  const { user } = useUser();
  const employeeId = user?.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addDepartmentalObjective = useCallback(
    async (objectiveData) => {
      setLoading(true);
      setError(null);

      try {
        // 1) Validate total weight (unchanged)
        const { data: sumData, error: sumErr } = await supabase.rpc(
          'get_total_departmental_objective_weight'
        );
        if (sumErr) throw sumErr;

        const currentSum = Number(sumData ?? 0);
        const nextSum = currentSum + Number(objectiveData?.weight ?? 0);
        if (nextSum > 100) {
          toast.error('Total Objectives weight cannot exceed 100%');
          return null;
        }

        // Build the base payload (same as before)
        const payload = {
          ...objectiveData,
          created_by: employeeId,
          updated_by: employeeId,
        };

        // 2) Remove employee_ids from the payload and keep them aside
        const employeeIds = Array.isArray(objectiveData?.employee_ids)
          ? objectiveData.employee_ids
          : [];
        const { employee_ids: _omit, ...payloadWithoutEmployeeIds } = payload;

        // 1) Insert into departmental_objectives (same functionality, full payload)
        const { data: deptRow, error: insertDeptErr } = await supabase
          .from('departmental_objectives')
          .insert([payload])
          .select('*')
          .single();

        if (insertDeptErr) throw insertDeptErr;

        // 3) For each employee, insert the SAME payload (minus employee_ids)
        //    into employee_objectives. NO departmental_objective_id here.
        if (employeeIds.length > 0) {
          const employeeRows = employeeIds.map((empId) => ({
            ...payloadWithoutEmployeeIds,
            employee_id: Number(empId),
            
          }));

          const { error: empInsertErr } = await supabase
            .from('employee_objectives')
            .insert(employeeRows);

          if (empInsertErr) {
            // If you prefer to roll back the departmental row on failure, uncomment:
            // await supabase.from('departmental_objectives').delete().eq('id', deptRow.id);
            throw empInsertErr;
          }
        }

        toast.success('Objective added successfully');
        return deptRow;
      } catch (err) {
        setError(err?.message || 'An unexpected error occurred');
        toast.error(`Error adding objective: ${err?.message || err}`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [employeeId]
  );

  return {
    addDepartmentalObjective,
    loading,
    error,
  };
}

// export function useAddDepartmentalObjective () {
//   const { user } = useUser()
//   const employeeId = user?.id

//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)

//   const addDepartmentalObjective = useCallback(
//     async objectiveData => {
//       setLoading(true)
//       setError(null)

//       try {
//         const { data: sumData, error } = await supabase.rpc('get_total_departmental_objective_weight')

//         if (error) throw error

//         if (sumData + objectiveData.weight > 100) {
//           toast.error('Total Objectives weight cannot exceed 100%')
//           return null
//         }

//         const payload = {
//           ...objectiveData,
//           created_by: employeeId,
//           updated_by: employeeId
//         }

//         const { data, error: insertError } = await supabase
//           .from('departmental_objectives')
//           .insert([payload])
//           .select('*')
//           .single()

//         if (insertError) throw insertError

//         toast.success('Objective added successfully')
//         return data
//       } catch (err) {
//         setError(err.message || 'An unexpected error occurred')
//         toast.error(`Error adding objective: ${err.message || err}`)
//       } finally {
//         setLoading(false)
//       }
//     },
//     [employeeId]
//   )

//   return {
//     addDepartmentalObjective,
//     loading,
//     error
//   }
// }

export function useDepartmentalObjectivesList (
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
        .from('departmental_objectives')
        .select('*', { count: 'exact' })
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

export function useDeleteDepartmentalObjective () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteObjectives = useCallback(async ids => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase.from('departmental_objectives')

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

export function useDepartmentalObjectiveById (objectiveId) {
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
          .from('departmental_objectives')
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

export function useUpdateDepartmentalObjective () {
  const { user } = useUser()
  const employeeId = user?.id

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateDepartmentalObjective = useCallback(
    async (id, objectiveData) => {
      setLoading(true)
      setError(null)

      try {
        const payload = {
          ...objectiveData,
          updated_by: employeeId
        }

        const { data, error: updateError } = await supabase
          .from('departmental_objectives')
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
    updateDepartmentalObjective,
    loading,
    error
  }
}

export function useDepartmentalUnits () {
  const [DepartmentalUnits, setDepartmentalUnits] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOrganizationUnits = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('departmental_units')
        .select('*')
        .order('created_at', {
          ascending: false
        })

      if (fetchError) throw fetchError

      setDepartmentalUnits(data ?? [])
    } catch (err) {
      console.error('Error fetching objectives:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrganizationUnits()
  }, [fetchOrganizationUnits])

  return {
    DepartmentalUnits,
    loading,
    error
  }
}
