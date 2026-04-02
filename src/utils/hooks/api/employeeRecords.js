import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../../supabaseClient'
import { applySearchFilter } from './approvals'
import { useUser } from '../../../context/UserContext'
import { ROLES } from '../../constants'

export function useGetEmployeeRecord () {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

//   const fetchEmployeeRecord = useCallback(async code => {
//     setLoading(true)
//     setError(null)

//     try {
//       if (!code) {
//         setData(null)
//         setLoading(false)
//         return
//       }
//       const { data: employeeData, error: rpcError } = await supabase
//         .from('employees')
//         .select(
//           `*, 
//             candidates:candidates!employees_candidate_id_fkey(*), 
//             company_info:company_info!employees_company_id_fkey(*), 
//             designations:designations!employees_designation_type_fkey(*), 
//             departments:organizational_units!employees_organizational_unit_fkey(*), 
//             employment_types:employment_types!fk_employment_types(*),
//             branches:branches!employees_branch_id_fkey(*)
//             `
//         )
//         .eq('employee_code', code)
//         .eq('is_deleted', false)
//         .single()

//       if (rpcError) {
//         setError(rpcError)
//         toast.error(`Error fetching Employee data: ${rpcError.message}`)
//       } else {
//         setData(employeeData ?? [])
//       }
//     } catch (err) {
//       setError(err)
//       toast.error(`Unexpected error: ${err.message || err}`)
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   return {
//     data,
//     loading,
//     error,
//     fetchEmployeeRecord
//   }
// }



  const fetchEmployeeRecord = useCallback(async code => {
  setLoading(true);
  setError(null);

  try {
    if (!code) {
      setData(null);
      setLoading(false);
      return;
    }

    // 1) Get employee (and whatever joins you already had)
    const { data: employeeData, error: empErr } = await supabase
      .from('employees')
      .select(
        `*, 
          candidates:candidates!employees_candidate_id_fkey(*), 
          company_info:company_info!employees_company_id_fkey(*), 
          designations:designations!employees_designation_type_fkey(*), 
          departments:organizational_units!employees_organizational_unit_fkey(*), 
          employment_types:employment_types!fk_employment_types(*),
          branches:branches!employees_branch_id_fkey(*)
        `
      )
      .eq('employee_code', code)
      .eq('is_deleted', false)
      .single();

    if (empErr) {
      setError(empErr);
      toast.error(`Error fetching Employee data: ${empErr.message}`);
      setLoading(false);
      return;
    }

    // Derive candidate_id (prefer employees.candidate_id if present, else candidates.id)
    const candidateId =
      employeeData?.candidate_id ??
      employeeData?.candidates?.id ??
      null;



       // Log follow-up API calls for related data
        const [
          education,
          certifications,
          experience,
          languages,
          competencies,
          relatives,
        ] = await Promise.all([
          window.supabase.from("education").select("*").eq("candidate_id", candidateId),
          window.supabase
            .from("certificates")
            .select("*")
            .eq("candidate_id", candidateId),
          window.supabase.from("experience").select("*").eq("candidate_id", candidateId),
          window.supabase.from("languages").select("*").eq("candidate_id", candidateId),
          window.supabase
            .from("competencies")
            .select("*")
            .eq("candidate_id", candidateId),
          window.supabase
            .from("candidate_referral")
            .select(
              `
            *,
            branch:branch_id(name),
            unit:unit_id(name),
            department:department_id(name)
          `
            )
            .eq("candidate_id", candidateId),
        ]);

    // let educationData = [];
    // if (candidateId) {
    //   // 2) Fetch education rows that match candidate_id
    //   const { data: eduRows, error: eduErr } = await supabase
    //     .from('education')
    //     .select('*')
    //     .eq('candidate_id', candidateId);

    //   if (eduErr) {
    //     // Non-fatal: keep employeeData but surface the error
    //     toast.error(`Error fetching Education data: ${eduErr.message}`);
    //   } else {
    //     educationData = eduRows ?? [];
    //   }
    // }

    // 3) Merge and set
    setData({
      ...employeeData,
       education: education ?? [],   // from your earlier step
  certifications,
  experience,
  languages,
  competencies,
  relatives,
    });
  } catch (err) {
    setError(err);
    toast.error(`Unexpected error: ${err.message || err}`);
  } finally {
    setLoading(false);
  }
}, []);

  return {
    data,
    loading,
    error,
    fetchEmployeeRecord
  }
}


/*export function useGetAllDesignations () {
  const [designations, setDesignations] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchDesignations = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase
        .from('designations')
        .select(`*`)
        .eq('is_deleted', false)

      if (rpcError) {
        setError(rpcError)
        toast.error(`Error fetching designations data: ${rpcError.message}`)
      } else {
        setDesignations(data ?? [])
      }
    } catch (err) {
      setError(err)
      toast.error(`Unexpected error: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDesignations()
  }, [fetchDesignations])

  return {
    designations,
    loading,
    error
  }
}

export function useGetAllBranches () {
  const [branches, setBranches] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchBranches = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase
        .from('branches')
        .select(`*`)
        .eq('is_deleted', false)

      if (rpcError) {
        setError(rpcError)
        toast.error(`Error fetching branches data: ${rpcError.message}`)
      } else {
        setBranches(data ?? [])
      }
    } catch (err) {
      setError(err)
      toast.error(`Unexpected error: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  return {
    branches,
    loading,
    error
  }
}

export function useGetAllUnits () {
  const [units, setUnits] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchBranches = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase
        .from('organizational_units')
        .select(`*`)
        .eq('is_deleted', false)


      if (rpcError) {
        setError(rpcError)
        toast.error(
          `Error fetching organizational units data: ${rpcError.message}`
        )
      } else {
        setUnits(data ?? [])
      }
    } catch (err) {
      setError(err)
      toast.error(`Unexpected error: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  return {
    units,
    loading,
    error
  }
}
*/
export function useGetAllEmployeeFormOptions () {
  const [designations, setDesignations] = useState([])
  const [branches, setBranches] = useState([])
  const [employees, setEmployees] = useState([])
  const [units, setUnits] = useState([])
  const [employmentTypes, setEmploymentTypes] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { user } = useUser()
  const role = user?.role
  const userOrgId = user?.organizational_unit_id
  const employeeId = user?.id

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!employeeId || !role || !userOrgId) {
      setLoading(false)
      return
    }

    try {
      const designationQuery = supabase
        .from('designations')
        .select('*')
        .eq('is_deleted', false)

      const branchQuery = supabase
        .from('branches')
        .select('*')
        .eq('is_deleted', false)

      const unitQuery = supabase
        .from('organizational_units')
        .select('*')
        .eq('is_deleted', false)

      const employmentTypeQuery = supabase.from('employment_types').select('*')

      let employeeQuery = supabase
        .from('employees')
        .select('*, candidates:candidates!employees_candidate_id_fkey(*)')
        .eq('is_deleted', false)
        .neq('id', employeeId)

      if (role === ROLES.MANAGER) {
        employeeQuery = employeeQuery.eq('organizational_unit_id', userOrgId)
      }

      const [
        { data: designationData, error: designationError },
        { data: branchData, error: branchError },
        { data: unitData, error: unitError },
        { data: employeeData, error: employeeError },
        { data: employmentTypeData, error: employmentTypeError }
      ] = await Promise.all([
        designationQuery,
        branchQuery,
        unitQuery,
        employeeQuery,
        employmentTypeQuery
      ])

      if (
        designationError ||
        branchError ||
        unitError ||
        employeeError ||
        employmentTypeError
      ) {
        throw (
          designationError ||
          branchError ||
          unitError ||
          employeeError ||
          employmentTypeError
        )
      }

      setDesignations(designationData ?? [])
      setBranches(branchData ?? [])
      setUnits(unitData ?? [])
      setEmployees(employeeData ?? [])
      setEmploymentTypes(employmentTypeData ?? [])
    } catch (err) {
      setError(err)
      toast.error(`Failed to load form options`)
    } finally {
      setLoading(false)
    }
  }, [role, userOrgId, employeeId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    designations,
    branches,
    units,
    employees,
    employmentTypes,
    loading,
    error,
    refetch: fetchAll
  }
}

export function useGetAllPolicies () {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPolicies = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.from('policy').select('*')

      if (error) {
        throw error
      }

      setPolicies(data ?? [])
    } catch (err) {
      setError(err)
      toast.error(`Failed to load form options`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPolicies()
  }, [fetchPolicies])

  return {
    policies,
    loading,
    error,
    refetch: fetchPolicies
  }
}

export function useGetEmployeeRequests (
  employeeId,
  table = 'vacation_requests',
  page = 0,
  searchQuery = '',
  perPage = 4
) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [count, setCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (!employeeId) {
        setData([])
        return
      }

      const from = page * perPage
      const to = from + perPage - 1

      let query = supabase.from(table).select('*', { count: 'exact' })

      query = applySearchFilter(query, table, searchQuery)

      const {
        data: requestData,
        error: rpcError,
        count
      } = await query.eq('employee_id', employeeId).range(from, to)

      if (rpcError) {
        throw rpcError
      }

      setData(requestData ?? [])
      setCount(count || 0)
      setTotalPages(Math.ceil((count || 0) / perPage))
    } catch (err) {
      setError(err)
      toast.error(`Error fetching vacation requests: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }, [employeeId, table, searchQuery, perPage, page])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  return { data, totalPages, count, loading, error }
}

export function useGetScheduledInterview (
  employeeId,
  type = '',
  page = 0,
  searchQuery = '',
  perPage = 4
) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [count, setCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchInterviews = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (!employeeId) {
        setData([])
        return
      }

      const from = page * perPage
      const to = from + perPage - 1

      const { data, error } = await supabase.rpc(
        'get_interviews_for_employee',
        {
          employee_id: employeeId,
          search_term: searchQuery || null,
          page_limit: perPage,
          page_offset: from
        },
        { count: 'exact' }
      )

      if (error) throw error

      setData(data?.interviews || [])
      setCount(data?.count || 0)
      setTotalPages(Math.ceil((data?.count || 0) / perPage))
      setError(null)

      //   if (rpcError) {
      //     throw rpcError
      //   }

      //   setData(requestData ?? [])
      //   setCount(count || 0)
      //   setTotalPages(Math.ceil((count || 0) / perPage))
    } catch (err) {
      setError(err)
      toast.error(`Error fetching vacation requests: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }, [employeeId, searchQuery, perPage, page])

  useEffect(() => {
    fetchInterviews()
  }, [fetchInterviews])

  return { data, totalPages, count, loading, error }
}

export function useUpdateEmployeeRecord () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateRecord = useCallback(async ({ employee, candidate }) => {
    setLoading(true)
    setError(null)

    try {
      if (!employee && !candidate) {
        throw new Error(
          'At least one of employee or candidate data must be provided.'
        )
      }

      const shouldUpdateEmploymentType =
        employee?.id && employee?.employment_type_id

      if (shouldUpdateEmploymentType) {
        const { data: existingEmployee, error: fetchError } = await supabase
          .from('employees')
          .select('employment_type_id, company_id')
          .eq('id', employee.id)
          .single()

        if (fetchError) throw new Error(`Fetch failed: ${fetchError.message}`)

        const isEmploymentTypeChanging =
          existingEmployee.employment_type_id !== employee.employment_type_id

        if (isEmploymentTypeChanging) {
          const confirmed = window.confirm(
            'Changing the employment type will erase and reassign leave qouta. Do you want to proceed?'
          )
          if (!confirmed) throw new Error('Update cancelled by user.')
//  Delete leaves taen
          const { error } = await supabase
            .from('leave_requests')
            .delete()
            .eq('employee_id', employee.id)
          if(error)  throw new Error(
            `Leave requests deletion failed`
          )
          // Delete previous leave quota
          const { error: deleteError } = await supabase
            .from('employee_leave_qouta')
            .delete()
            .eq('employee_id', employee.id)

          if (deleteError)
            throw new Error(
              `Leave quota deletion failed: ${deleteError.message}`
            )

          // Fetch new insurance leaves
          const { data: insuranceLeaves, error: insuranceError } =
            await supabase
              .from('leaves_vacations_insurance')
              .select('*')
              .eq('employment_type_id', employee.employment_type_id)
              .eq('company_id', existingEmployee.company_id)

          if (insuranceError)
            throw new Error(
              `Error fetching leave types: ${insuranceError.message}`
            )

          // Insert new leave quota
          const leaveQuotaRows = insuranceLeaves.map(item => ({
            employee_id: employee.id,
            leave_type_id: item.id,
            total_leaves: item.days_allowed,
            available_leaves: item.days_allowed,
            availed_leaves: 0
          }))


          const { error: quotaInsertError } = await supabase
            .from('employee_leave_qouta')
            .insert(leaveQuotaRows)

          if (quotaInsertError)
            throw new Error(
              `Error inserting leave quota: ${quotaInsertError.message}`
            )
        }
      }

      // Update employee if provided
      if (employee?.id) {
        const { error: employeeError } = await supabase
          .from('employees')
          .update(employee)
          .eq('id', employee.id)

        if (employeeError)
          throw new Error(`Employee update failed: ${employeeError.message}`)
      }

      // Update candidate if provided
      if (candidate?.id) {
        const { error: candidateError } = await supabase
          .from('candidates')
          .update(candidate)
          .eq('id', candidate.id)

        if (candidateError)
          throw new Error(`Candidate update failed: ${candidateError.message}`)
      }

      toast.success('Record(s) updated successfully.')
    } catch (err) {
      console.error(err)
      setError(err.message || 'An unexpected error occurred')
      toast.error(`Update failed: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    updateRecord,
    loading,
    error
  }
}
