import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";
import { ROLES } from '../../constants'


// // List events using get_filtered_events (is_deleted=false handled inside RPC)
// export function useCorporateEventsList(page = 0, pageSize = 10, searchQuery = "") {
//   const [eventData, setEventData] = useState([]);
//   const [totalPages, setTotalPages] = useState(0);
//   const [count, setCount] = useState(0);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const { user } = useUser();
//   const employeeId = user?.id ?? null;
//   const companyId = user?.company_id ?? null;
//     const my_branch_id = user?.branch_id ?? null;
//     const my_organizational_unit_id = user?.organizational_unit_id ?? null;


//   const fetchEvents = useCallback(async () => {
//     if (!employeeId || !companyId) return;

//     setLoading(true);
//     setError(null);

//     const offset = page * pageSize;
//     const limit = pageSize;

//     // today as YYYY-MM-DD (if your RPC needs it)
//     const today = new Date();
//     const yyyy = today.getFullYear();
//     const mm = String(today.getMonth() + 1).padStart(2, "0");
//     const dd = String(today.getDate()).padStart(2, "0");
//     const dateString = `${yyyy}-${mm}-${dd}`;

//     try {
//       const { data, error: sbError } = await supabase.rpc("get_filtered_events", {
//         p_employee_id: employeeId,
//         p_company_id: companyId,
//         p_search: searchQuery?.trim() ? searchQuery.trim() : null,
//         p_limit: limit,
//         p_offset: offset,
//         // If your RPC supports today's date filter, uncomment:
//         p_today: dateString,
//       });

//       console.log("========234234234", data);

//       if (sbError) throw sbError;

//       const rows = Array.isArray(data) ? data : [];

//       // Try to read a total count from the RPC rows (common pattern).
//       // Adjust the keys if your RPC returns a different name.
//       const derivedCount =
//         (rows[0]?.total_count ??
//           rows[0]?.full_count ??
//           rows[0]?.count ??
//           0) || 0;

//       // If RPC doesn't return a total count, fall back to the current page length.
//       const totalCount = derivedCount || rows.length;

//       setEventData(rows);
//       setCount(totalCount);
//       setTotalPages(Math.ceil(totalCount / pageSize));
//     } catch (err) {
//       setEventData([]);
//       setCount(0);
//       setTotalPages(0);
//       setError(err?.message || "An unexpected error occurred");
//       toast.error(`Error loading events: ${err?.message || err}`);
//     } finally {
//       setLoading(false);
//     }
//   }, [employeeId, companyId, page, pageSize, searchQuery]);

//   useEffect(() => {
//     let isCancelled = false;
//     if (!isCancelled) fetchEvents();
//     return () => {
//       isCancelled = true;
//     };
//   }, [fetchEvents]);

//   return {
//     eventData,
//     totalPages,
//     count,
//     error,
//     loading,
//     refetch: fetchEvents,
//   };
// }



// List events directly from events table with filters
export function useCorporateEventsList(page = 0, pageSize = 10, searchQuery = "") {
  const [eventData, setEventData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const employeeId = user?.id ?? null;
  const companyId = user?.company_id ?? null;
  const my_branch_id = user?.branch_id ?? null;
  const my_organizational_unit_id = user?.organizational_unit_id ?? null;

  const fetchEvents = useCallback(async () => {
    if (!employeeId || !companyId) return;

    setLoading(true);
    setError(null);

    const offset = page * pageSize;
    const limit = pageSize;
    

    try {
  //     // Base query
  //     let query = supabase
  //       .from("events")
  //       .select("*", { count: "exact" })
  //       .eq("company_id", companyId)
  //       .eq("is_deleted", false);

  //       if(user.role != ROLES.ADMIN){
  // // Apply OR conditions
  //     query = query.or(
  //       [
  //         `organizational_unit_ids.cs.{${my_organizational_unit_id}}`,
  //         `employee_ids.cs.{${employeeId}}`,
  //         `for_organization.eq.true`,
  //         `branch_id.eq.${my_branch_id}`,
  //       ].join(",")
  //     );
  //       }

  // Base query
let query = supabase
  .from("events")
  .select("*", { count: "exact" })
  .eq("company_id", companyId)
  .eq("is_deleted", false);

if (user.role !== ROLES.ADMIN) {
  // Build OR filters dynamically
  const orFilters = [
    `organizational_unit_ids.cs.{${my_organizational_unit_id}}`,
    `employee_ids.cs.{${employeeId}}`,
    `for_organization.eq.true`,
  ];

  if (my_branch_id != null) {
    orFilters.push(`branch_id.eq.${my_branch_id}`);
  }

  query = query.or(orFilters.join(","));
}


    

      // Search filter if any
      if (searchQuery?.trim()) {
        const s = searchQuery.trim();
        query = query.or(
          `name.ilike.%${s}%,description.ilike.%${s}%`
        );
      }

      // Pagination + ordering
      const { data, error: sbError, count: totalCount } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (sbError) throw sbError;

      setEventData(data || []);
      setCount(totalCount || 0);
      setTotalPages(Math.ceil((totalCount || 0) / pageSize));
    } catch (err) {
      console.error("Error fetching events:", err);
      setEventData([]);
      setCount(0);
      setTotalPages(0);
      setError(err?.message || "An unexpected error occurred");
      toast.error(`Error loading events: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  }, [employeeId, companyId, page, pageSize, searchQuery, my_branch_id, my_organizational_unit_id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    eventData,
    totalPages,
    count,
    error,
    loading,
    refetch: fetchEvents,
  };
}





// Create event
export function useCreateCorporateEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const createCorporateEvent = useCallback(
    async (eventData) => {
      if (!user?.id) {
        toast.error("User not authenticated");
        return { success: false };
      }
      setLoading(true);
      setError(null);

    const hasEmployees = Array.isArray(eventData?.employee_id) && eventData.employee_id.length > 0;
    const hasDepartments = Array.isArray(eventData?.department_id) && eventData.department_id.length > 0;
    const hasBranch = eventData?.branch_id && String(eventData.branch_id).trim().length > 0;
    const isOrgWide = eventData?.for_organization === true;


      try {
        const payload = {
          start_date: eventData.start_date,
          end_date: eventData.end_date,
          name: eventData.name,
          location: eventData.location,
          date: eventData.date,
          description: eventData.description,
          status: eventData.status,
          created_by_id: user.id,
          company_id: eventData.company_id || 1,
          is_deleted: false,
          for_organization: eventData.for_organization,
          branch_id: !isOrgWide && !hasEmployees && hasBranch ? Number(eventData.branch_id) : null,
          organizational_unit_ids: eventData.organizational_unit_ids,
          employee_ids: eventData.employee_ids,
          status_workflow: eventData.status_workflow
        };

        payload.status = "pending";

 // Role-based approval logic
        // if (user?.role === ROLES.EMPLOYEE) {
        //   payload.status = "pending";
        //   payload.is_manager_approve = "approved";
        //   payload.is_hr_approve = "pending";
        //   payload.is_hr_manager_approve = "pending";
        // } else if (user?.role === ROLES.MANAGER) {
        //   const myOrg = user?.organizational_unit_id;
        //   const isMyOrgIncluded =
        //     Array.isArray(eventData?.organizational_unit_ids) &&
        //     eventData.organizational_unit_ids.includes(myOrg);

        //   payload.status = "pending";
        //   payload.is_manager_approve = isMyOrgIncluded ? "approved" : "pending";
        //   payload.is_hr_approve = "pending";
        //   payload.is_hr_manager_approve = "pending";
        // } else if (user?.role === ROLES.HR) {
        //   payload.status = "pending";
        //   payload.is_manager_approve = "approved";
        //   payload.is_hr_approve = "approved";
        //   payload.is_hr_manager_approve = "pending";
        // } else 
          
    if (
          user?.role === ROLES.HR_MANAGER ||
          user?.role === ROLES.ADMIN
        ) {
          payload.status = "approved";
           payload.status_workflow = (eventData.status_workflow || []).map((step) => ({
    ...step,
    status: "approved",
  }));
  
          // payload.is_manager_approve = "approved";
          // payload.is_hr_approve = "approved";
          // payload.is_hr_manager_approve = "approved";
        }

        // Force manager approval if org-wide or branch targeted
if (eventData.for_organization === true || Number(eventData.branch_id)) {
          payload.is_manager_approve = "approved";
        }


        const { data: insertData, error: sbError } = await supabase
          .from("events")
          .insert([payload])
          .select();
        if (sbError) throw sbError;


const eventID = insertData?.[0]?.id;

  
      // If org-wide, we're done
      if (!isOrgWide) {
        if (hasEmployees) {
          // ✅ Link selected employees (adjust table name/columns if yours differ)
          const employeeRows = eventData.employee_id.map((eid) => ({
            employee_id: Number(eid),
          event_id: eventID,
          }));
  
          const { error: empLinkErr } = await supabase
            .from("employee_events")
            .insert(employeeRows);
  
          if (empLinkErr) {
            throw new Error("Error linking employees: " + empLinkErr.message);
          }
        } else if (hasDepartments) {
          // ✅ Link selected departments (existing behavior)
          const departmentRows = eventData.department_id.map((deptId) => ({
            department_id: parseInt(deptId, 10),
            event_id: eventID,
          }));
  
          const { error: deptInsertError } = await supabase
            .from("department_events")
            .insert(departmentRows);
  
          if (deptInsertError) {
            throw new Error("Error linking departments: " + deptInsertError.message);
          }
        }
        // else: only branch_id persisted on announcement row, no extra linking needed
      }


        toast.success("Event created successfully");
        return { success: true, insertData };
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
        toast.error(`Error creating event: ${err.message || err}`);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );
  return { createCorporateEvent, loading, error };
}

// Update event
export function useUpdateCorporateEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const updateCorporateEvent = useCallback(
    async (id, eventData) => {
      if (!user?.id) {
        toast.error("User not authenticated");
        return { success: false };
      }
      setLoading(true);
      setError(null);
      try {
        const payload = {
          start_date: eventData.start_date,
          end_date: eventData.end_date,
          name: eventData.name,
          location: eventData.location,
          time: eventData.time,
          description: eventData.description,
          status: eventData.status,
          company_id: eventData.company_id || 1,
        };
        const { data, error: sbError } = await supabase
          .from("events")
          .update(payload)
          .eq("id", id)
          .select();
        if (sbError) throw sbError;
        toast.success("Event updated successfully");
        return { success: true, data };
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
        toast.error(`Error updating event: ${err.message || err}`);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );
  return { updateCorporateEvent, loading, error };
}

// Soft delete events
export function useDeleteCorporateEvents() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const deleteCorporateEvents = useCallback(
    async (ids) => {
      if (!user?.id) {
        toast.error("User not authenticated");
        return { success: false };
      }
      if (!ids || ids.length === 0) {
        toast.error("No events selected for deletion");
        return { success: false };
      }
      setLoading(true);
      setError(null);
      try {
        const { error: sbError } = await supabase
          .from("events")
          .update({ is_deleted: true })
          .in("id", ids);
        if (sbError) throw sbError;
        toast.success("Event(s) deleted successfully");
        return { success: true };
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
        toast.error(`Error deleting event(s): ${err.message || err}`);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );
  return { deleteCorporateEvents, loading, error };
}

// Get event by ID
export function useCorporateEventById(id) {
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error: sbError }) => {
        if (sbError) {
          setError(sbError.message);
          setEventData(null);
        } else {
          setEventData(data);
        }
        setLoading(false);
      });
  }, [id]);
  return { eventData, loading, error };
}

export function useCorporateEventsByYear() {
  const [eventsByYear, setEventsByYear] = useState({});
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true);
    setError(null);
    // Fetch all events (not deleted)
    supabase
      .from("events")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .then(({ data, error: sbError }) => {
        if (sbError) {
          setError(sbError.message);
          setEventsByYear({});
          setYears([]);
        } else {
          // Group by year
          const grouped = {};
          (data || []).forEach((event) => {
            const year = (event.created_at || "").slice(0, 4);
            if (!grouped[year]) grouped[year] = [];
            grouped[year].push(event);
          });
          const sortedYears = Object.keys(grouped).sort((a, b) => b - a);
          setEventsByYear(grouped);
          setYears(sortedYears);
        }
        setLoading(false);
      });
  }, []);
  return { eventsByYear, years, loading, error };
}
