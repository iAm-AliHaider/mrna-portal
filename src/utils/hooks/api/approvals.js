import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../supabaseClient'
import toast from 'react-hot-toast'
import { useUser } from '../../../context/UserContext'
import { ROLES, TRANSACTION_TYPE_MAP } from '../../constants'
import { constructNow, differenceInCalendarDays, parseISO } from 'date-fns'
import { CollectionsOutlined } from '@mui/icons-material'

export function useMyApprovalsList (
  page = 0,
  pageSize = 10,
  searchQuery = '',
  type = 'loan_requests',
  empCode = ''
) {
  const [approvalsData, setApprovalsData] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [count, setCount] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const { user } = useUser()
  const userOrgId = user?.organizational_unit_id
const myFirstName = user?.first_name;
const myRole = user?.role;


  // const fetchMyApprovals = useCallback(
  //   async (filters = null) => {
  //     // Early return if user data is not available yet
  //     if (!user || !userOrgId) {
  //       setLoading(false)
  //       setApprovalsData([])
  //       setCount(0)
  //       setTotalPages(0)
  //       return
  //     }

  //     setLoading(true)
  //     setError(null)

  //     try {
  //       const { select, table } = TRANSACTION_TYPE_MAP[type]

  //       if (!select || !table) {
  //         throw new Error(`Invalid type: ${type}`)
  //       }

  //       const from = page * pageSize
  //       const to = from + pageSize - 1

  //       // Build query dynamically
  //       let query = supabase.from(table).select(select, { count: 'exact' })
  //       // .neq('created_by', user?.id)

  //       query = applySearchFilter(query, type, searchQuery)

  //       if(['advance_salary', 'pay_stopage'].includes(type)){
  //         query = query.eq('type', type)
  //       }


  //       if (empCode) {
  //         query = query.eq('employees.employee_code', empCode)
  //       }

  //       if (user?.role === ROLES.MANAGER) {
  //                   query = query.eq('employees.organizational_unit_id', userOrgId)

          
  //       if(type != "suggestion_request" && type != "event_request"){
  //         query = query.eq('employees.role_columns->roles', '["employee"]')
  //       }

  //       if(type === "suggestion_request"){
  //         query = query.eq(
  //           'report_type',
  //           'suggestion'
  //         )
  //       }
  //       }

     

  //       if (user?.role === ROLES.HR) {
  //         query = query.eq('is_manager_approve', 'approved')

  //         if(type != "suggestion_request" && type != "event_request"){
  //         query = query.neq(
  //           'employees.role_columns->roles',
  //           '["employee", "hr_manager"]'
  //         )
  //       }

  //       if(type === "suggestion_request"){
  //         query = query.eq(
  //           'report_type',
  //           'suggestion'
  //         )
  //       }
  //       }

  //       if (user?.role === ROLES.HR_MANAGER) {
  //         query = query
  //           .eq('is_manager_approve', 'approved')
  //           .eq('is_hr_approve', 'approved')

  //     if(type === "suggestion_request"){
  //         query = query.eq(
  //           'report_type',
  //           'suggestion'
  //         )
  //       }
  //       }

  //       if (typeof filters?.is_approved !== 'undefined') {
  //         if (filters?.is_approved) {
  //           query = query.not('status', 'eq', 'pending')
  //         }
  //       }
        

  //       if (filters?.status && filters?.status !== 'all') {
  //         query = query.eq('status', filters?.status)
  //       }

  //       if (filters?.creation_date) {
  //         query = query.gte('created_at', filters?.creation_date)
  //       }

  //       if (filters?.last_update) {
  //         query = query.gte('updated_at', filters?.last_update)
  //       }

  //       const {
  //         data,
  //         error: sbError,
  //         count: totalCount
  //       } = await query
  //         .order('created_at', { ascending: false })
  //         .range(from, to)

  //       if (sbError) {
  //         throw new Error(sbError.message || 'Database query failed')
  //       }

  //       setApprovalsData(data || [])
  //       setCount(totalCount || 0)
  //       setTotalPages(Math.ceil((totalCount || 0) / pageSize))
  //     } catch (err) {
  //       console.error('Error fetching approvals:', err)
  //       const errorMessage = err.message || 'An unexpected error occurred'
  //       setError(errorMessage)
  //       toast.error(`Error loading approvals: ${errorMessage}`)

  //       setApprovalsData([])
  //       setCount(0)
  //       setTotalPages(0)
  //     } finally {
  //       setLoading(false)
  //     }
  //   },
  //   [page, pageSize, searchQuery, type, user, userOrgId, empCode]
  // )


  const fetchMyApprovals = useCallback(
  async (filters = null) => {
    // Early return if user data is not available yet
    if (!user || !userOrgId) {
      setLoading(false);
      setApprovalsData([]);
      setCount(0);
      setTotalPages(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { select, table } = TRANSACTION_TYPE_MAP[type];

      if (!select || !table) {
        throw new Error(`Invalid type: ${type}`);
      }


      const from = page * pageSize;
      const to = from + pageSize - 1;

      // Build query dynamically
      let query = supabase.from(table).select(select, { count: "exact" });

      // existing search
      query = applySearchFilter(query, type, searchQuery);

      if (["advance_salary", "pay_stopage"].includes(type)) {
        query = query.eq("type", type);
      }

      if (empCode) {
        query = query.eq("employees.employee_code", empCode);
      }

     
      
      if (type === "event_request") {
        if (myRole === ROLES.EMPLOYEE) {
          // events where current user is included in employee_ids
          query = query.contains("employee_ids", [user.id]);
        } else if (myRole === ROLES.MANAGER) {
          // events where manager's org unit is included in organizational_unit_ids
          if (userOrgId) {
            query = query.contains("organizational_unit_ids", [userOrgId]);
          }
        }
      } else {
       
        
        if (myRole === ROLES.MANAGER) {
          query = query.eq("employees.organizational_unit_id", userOrgId);

          if (type !== "suggestion_request" && type !== "event_request") {
            query = query.eq("employees.role_columns->roles", '["employee"]');
          }

          if (type === "suggestion_request") {
            query = query.eq("report_type", "suggestion");
          }
        }

        if (myRole === ROLES.HR) {
          // query = query.eq("is_manager_approve", "approved");

          if (type !== "suggestion_request" && type !== "event_request") {
            query = query.neq(
              "employees.role_columns->roles",
              '["employee", "hr_manager"]'
            );
          }

          if (type === "suggestion_request") {
            query = query.eq("report_type", "suggestion");
          }
        }

        if (myRole === ROLES.HR_MANAGER) {
          // query = query
          //   .eq("is_manager_approve", "approved")
          //   .eq("is_hr_approve", "approved");

          if (type === "suggestion_request") {
            query = query.eq("report_type", "suggestion");
          }
        }
      }

      

      if(type === "asset_requests"){
        query =query.eq("assignment_type", "take_asset_from_employee")
      }

      if (typeof filters?.is_approved !== "undefined") {
        if (filters?.is_approved) {
          query = query.not("status", "eq", "pending");
        }
      }

      if (filters?.status && filters?.status !== "all") {
        query = query.eq("status", filters?.status);
      }

      if (filters?.creation_date) {
        query = query.gte("created_at", filters?.creation_date);
      }

      if (filters?.last_update) {
        query = query.gte("updated_at", filters?.last_update);
      }

      const {
        data,
        error: sbError,
        count: totalCount,
      } = await query.order("created_at", { ascending: false }).range(from, to);

      if (sbError) {
        throw new Error(sbError.message || "Database query failed");
      }

let finalData = data || [];

// Only update if role is hr or manager
if (["hr", "manager"].includes(myRole) && myFirstName) {
  finalData = finalData.map((row) => {
    if (Array.isArray(row.status_workflow) && row.status_workflow.length > 0) {
      const newWorkflow = row.status_workflow.map((step) =>
        step.role === myRole
          ? { ...step, name: myFirstName || step.name }
          : step
      );

      return { ...row, status_workflow: newWorkflow };
    }
    return row;
  });
}

// finally update state
setApprovalsData(finalData);
      setCount(totalCount || 0);
      setTotalPages(Math.ceil((totalCount || 0) / pageSize));
    } catch (err) {
      console.error("Error fetching approvals:", err);
      const errorMessage = err.message || "An unexpected error occurred";
      setError(errorMessage);
      toast.error(`Error loading approvals: ${errorMessage}`);

      setApprovalsData([]);
      setCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  },
  [page, pageSize, searchQuery, type, user, userOrgId, empCode]
);


  useEffect(() => {
    let isCancelled = false
    let timeoutId

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchMyApprovals()
      }
    }

    if (searchQuery && searchQuery.trim()) {
      timeoutId = setTimeout(executeFetch, 300)
    } else {
      executeFetch()
    }

    return () => {
      isCancelled = true
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [
    fetchMyApprovals,
    page,
    pageSize,
    searchQuery,
    type,
    user,
    userOrgId,
    empCode
  ])

  return {
    approvalsData,
    totalPages,
    count,
    error,
    loading,
    refetch: fetchMyApprovals
  }
}





// export function useUpdateTicketApproval() {
//   const [loading, setLoading] = useState(false);
//   const { user } = useUser();
//   const userRole = user?.role;

//   const updateTicketApproval = useCallback(
//     async (id, status, refetch, payload = null, overrideStatus = null) => {
//       setLoading(true);
//       try {
//         if (!id) throw new Error("Missing request id");

//         // keep only defined fields from payload
//         const clean = (obj) =>
//           Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== undefined));

//         const base = clean(payload);
//         const s = (status || "").toLowerCase();
//         const reason = payload?.rejection_reason ?? payload?.reason ?? null;

//         let updates = { ...base };

//         // Append approval flags per role (mirrors your reference behavior)
//         if (userRole === ROLES.HR) {
//           updates = {
//             ...updates,
//             is_hr_approve: status,
//             rejection_reason: reason,
//           };
//           if (s === "rejected") updates.status = "rejected";
//           if (overrideStatus === "cancelation_rejected") updates.status = overrideStatus;
//         } else if (userRole === ROLES.HR_MANAGER) {
//           updates = {
//             ...updates,
//             is_hr_manager_approve: status,
//             rejection_reason: reason,
//             status: overrideStatus ?? status,
//           };
//         } else if (userRole === ROLES.MANAGER) {
//           updates = {
//             ...updates,
//             is_manager_approve: status,
//             rejection_reason: reason,
//           };
//           if (s === "rejected") updates.status = "rejected";
//           if (overrideStatus === "cancelation_rejected") updates.status = overrideStatus;
//         } else {
//           // Fallback for other roles: just apply status (override wins)
//           updates = {
//             ...updates,
//             ...(overrideStatus ? { status: overrideStatus } : status ? { status } : {}),
//           };
//         }

//         const { data, error } = await supabase
//           .from("ticket_requests")
//           .update(updates)
//           .eq("id", id)
//           .select();

//         if (error) throw error;

//         if (typeof toast !== "undefined") {
//           const msgStatus = updates.status || status || "updated";
//           toast.success(`Request ${msgStatus} successfully.`);
//         }

//         refetch?.();
//         return { data, error: null };
//       } catch (err) {
//         if (typeof toast !== "undefined") {
//           toast.error(`An unexpected error occurred: ${err.message || err}`);
//         }
//         return { data: null, error: err };
//       } finally {
//         setLoading(false);
//       }
//     },
//     [userRole]
//   );

//   return { updateTicketApproval, loading };
// }

// export function useUpdateRequestStatus (type = 'loan_requests') {
//   const [loading, setLoading] = useState(false)
//   const { user } = useUser()
//   const userRole = user?.role
//   const updateRequestStatus = useCallback(
//     async (id, status, refetch, reason = null, cancelationStatus = null) => {
//       setLoading(true)
//       try {
//         const { table } = TRANSACTION_TYPE_MAP[type]
//         const query = supabase.from(table)
//         const updatedQuery = getUpdatePayload(query, userRole, status, reason, cancelationStatus)

//         const { data: inserted, error: insertError } = await updatedQuery
//           .eq('id', id)
//           .select()


//         if (insertError) {
//           throw new Error(insertError)
//         }

//         if (userRole === ROLES.HR_MANAGER && status === 'approved') {
//           await updateLeaveQouta(inserted)
//         }
        
//         if (userRole === ROLES.HR_MANAGER && status.toLowerCase() === 'cancelation_approved') {
//           await updateLeaveQouta(inserted)
//         }

//         toast.success(`Request ${status} successfully.`)
//         refetch()
//         return { data: inserted, error: null }
//       } catch (err) {
//         toast.error(`An unexpected error occurred: ${err.message || err}`)
//         return { data: null, error: err }
//       } finally {
//         setLoading(false)
//       }
//     },
//     [userRole, type]
//   )

//   return { updateRequestStatus, loading }
// }

// const getUpdatePayload = (query, role, status, reason, cancelationStatus = null) => {
//   if (role === ROLES.HR) {
//     let obj = { is_hr_approve: status, rejection_reason: reason }
//     if (status === 'rejected') obj = { ...obj, status: status }
//     if (cancelationStatus==='cancelation_rejected') {obj = { ...obj, status: cancelationStatus }}
//     return query.update(obj)
//   }
//   if (role === ROLES.HR_MANAGER) {
//     return query.update({
//       is_hr_manager_approve: status,
//       status: cancelationStatus?cancelationStatus:status,
//       rejection_reason: reason
//     })
//   }
//   if (role === ROLES.MANAGER) {
//     let obj = { is_manager_approve: status, rejection_reason: reason }
//     if (status === 'rejected') {obj = { ...obj, status: status }}
//     if (cancelationStatus==='cancelation_rejected') {obj = { ...obj, status: cancelationStatus }}
//     return query.update(obj)
//   }
//   return query
// }



// const updateLeaveQouta = async request => {
//   try {
//     const { employee_id, leave_type_id, start_date, end_date } =
//       request?.[0] || {}
//     if (!employee_id || !leave_type_id || !start_date || !end_date) {
//       console.error('Missing required fields to update leave quota.')
//       return
//     }

//     const start = parseISO(start_date)
//     const end = parseISO(end_date)
//     const days = differenceInCalendarDays(end, start) + 1

//     if (days <= 0) {
//       console.error('Invalid leave duration calculated.')
//       return
//     }

//     const { data: quota, error: fetchError } = await supabase
//       .from('employee_leave_qouta')
//       .select('availed_leaves,available_leaves')
//       .eq('employee_id', employee_id)
//       .eq('id', leave_type_id)
//       .single()

//     if (fetchError || !quota) {
//       console.error('Failed to fetch quota record:', fetchError)
//       return
//     }

//     let newAvailedLeaves = (quota.availed_leaves || 0) + days
//     let newAvailableLeaves = (quota.available_leaves || 0) - days
//     if(request?.[0]?.status?.toLowerCase() === 'cancelation_approved') {
//       newAvailedLeaves = (quota.availed_leaves || 0) - days
//       newAvailableLeaves = (quota.available_leaves || 0) + days
//     }
//     const { error: updateError } = await supabase
//       .from('employee_leave_qouta')
//       .update({ availed_leaves: newAvailedLeaves, available_leaves: newAvailableLeaves })
//       .eq('employee_id', employee_id)
//       .eq('id', leave_type_id)

//     if (updateError) {
//       console.error('Error updating availed leaves:', updateError)
//     } else {
//       console.log(
//         `Updated availed_leaves to ${newAvailedLeaves} for employee ${employee_id}`
//       )
//     }
//   } catch (error) {
//     console.error('Unexpected error in updateLeaveQouta:', error)
//   }
// }



export function useUpdateTicketApproval() {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const userRole = user?.role;


  const updateTicketApproval = useCallback(
    async (id, status, refetch, payload = null, overrideStatus = null, reason = null) => {
      setLoading(true);
      try {
        if (!id) throw new Error("Missing request id");

        // 1. Fetch current workflow
        const { data: current, error: fetchErr } = await supabase
          .from("ticket_requests")
          .select("status_workflow")
          .eq("id", id)
          .single();

        if (fetchErr) throw fetchErr;

        let workflow = current?.status_workflow || [];

        // 2. Update the role step
        workflow = workflow.map((step) =>
          step.role === userRole
            ? { ...step, status, rejection_reason: reason || null}
            : step
        );

        // 3. Build updates
        const updates = {
          ...(payload || {}),
          status_workflow: workflow,
          ...(overrideStatus ? { status: overrideStatus } : {}),
        };

        if (status === "rejected") updates.status = "rejected";

        // 4. Push update
        const { data, error } = await supabase
          .from("ticket_requests")
          .update(updates)
          .eq("id", id)
          .select();

        if (error) throw error;

        toast.success(`Request ${status} successfully.`);
        refetch?.();

        return { data, error: null };
      } catch (err) {
        console.error("Error updating approval:", err.message || err);
        toast.error(`An error occurred: ${err.message || err}`);
        return { data: null, error: err };
      } finally {
        setLoading(false);
      }
    },
    [userRole]
  );

  return { updateTicketApproval, loading };
}


export function useUpdateRequestStatus(type = "loan_requests") {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const userRole = user?.role;


  const updateRequestStatus = useCallback(
    async (id, status, refetch, reason = null, cancelationStatus = null) => {
      setLoading(true);
      try {
        const { table } = TRANSACTION_TYPE_MAP[type];
        if (!table) throw new Error(`Unknown transaction type: ${type}`);

        // 1. Fetch current workflow
        const { data: current, error: fetchErr } = await supabase
          .from(table)
          .select("status_workflow")
          .eq("id", id)
          .single();

        if (fetchErr) throw fetchErr;

        let workflow = current?.status_workflow || [];

        // 2. Update the role that matches the current user
        workflow = workflow.map((step) =>
          step.role === userRole
            ? { ...step, status, rejection_reason: reason || null }
            : step
        );


// 4. Determine new status
let new_status = current.status || "pending";

        if (userRole === ROLES.HR_MANAGER && status === "approved") {
            new_status = "approved";
        }


        // 3. Build updates
        const updates = {
          status_workflow: workflow,
          status: new_status
        };

        if (status === "rejected") updates.status = "rejected";
        if (cancelationStatus) updates.status = cancelationStatus;

        // 4. Push update
        const { data: updated, error } = await supabase
          .from(table)
          .update(updates)
          .eq("id", id)
          .select();

        if (error) throw error;

        // 5. Special case for leave quota when HR Manager approves/cancels
        if (userRole === ROLES.HR_MANAGER && status === "approved") {
          await updateLeaveQouta(updated);
        }
        if (
          userRole === ROLES.HR_MANAGER &&
          status.toLowerCase() === "cancelation_approved"
        ) {
          await updateLeaveQouta(updated);
        }

        toast.success(`Request ${status} successfully.`);
        refetch?.();

        return { data: updated, error: null };
      } catch (err) {
        console.error("Update error:", err);
        toast.error(`An unexpected error occurred: ${err.message || err}`);
        return { data: null, error: err };
      } finally {
        setLoading(false);
      }
    },
    [userRole, type]
  );

  return { updateRequestStatus, loading };
}


const updateLeaveQouta = async (request) => {
  try {
    const { employee_id, leave_type_id, start_date, end_date } =
      request?.[0] || {};
    if (!employee_id || !leave_type_id || !start_date || !end_date) {
      console.error("Missing required fields to update leave quota.");
      return;
    }

    const start = parseISO(start_date);
    const end = parseISO(end_date);
    const days = differenceInCalendarDays(end, start) + 1;

    if (days <= 0) {
      console.error("Invalid leave duration calculated.");
      return;
    }

    const { data: quota, error: fetchError } = await supabase
      .from("employee_leave_qouta")
      .select("availed_leaves,available_leaves")
      .eq("employee_id", employee_id)
      .eq("id", leave_type_id)
      .single();

    if (fetchError || !quota) {
      console.error("Failed to fetch quota record:", fetchError);
      return;
    }

    let newAvailedLeaves = (quota.availed_leaves || 0) + days;
    let newAvailableLeaves = (quota.available_leaves || 0) - days;

    if (request?.[0]?.status?.toLowerCase() === "cancelation_approved") {
      newAvailedLeaves = (quota.availed_leaves || 0) - days;
      newAvailableLeaves = (quota.available_leaves || 0) + days;
    }

    const { error: updateError } = await supabase
      .from("employee_leave_qouta")
      .update({
        availed_leaves: newAvailedLeaves,
        available_leaves: newAvailableLeaves,
      })
      .eq("employee_id", employee_id)
      .eq("id", leave_type_id);

    if (updateError) {
      console.error("Error updating availed leaves:", updateError);
    } else {
    }
  } catch (error) {
    console.error("Unexpected error in updateLeaveQouta:", error);
  }
};


export const applySearchFilter = (query, type, searchQuery) => {
  if (!searchQuery || !searchQuery.trim()) {
    return query
  }
  const q = searchQuery.trim()
  switch (type) {
    case 'resignation_request':
      return query.ilike('resignation', `%${q}%`)
    case 'vacation_requests':
      return query.ilike('description', `%${q}%`)
    case 'ticket_requests':
      return query.ilike('notes', `%${q}%`)
    case 'business_travels':
      return query.ilike('business_travel_definition', `%${q}%`)
    case 'official_letters':
      return query.ilike('reference_number', `%${q}%`)
    case 'course_applications':
      return query.ilike('determine_need', `%${q}%`)
    case 'overtime_requests':
      return query.ilike('rejection_reason', `%${q}%`)
    default:
      return query.ilike('reason', `%${q}%`)
  }
}