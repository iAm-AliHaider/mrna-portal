import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
import { useUser } from "../../../context/UserContext";
import { TRANSACTION_TYPE_MAP } from "../../constants";
import { applySearchFilter } from "./approvals";

export function useMyTransactionsList(
  page = 0,
  pageSize = 10,
  searchQuery = "",
  type = "loan_requests",
  employeeId
) {
  const [transactionsData, setTransactionsData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    is_approved: false,
    status: "",
    created_from: "",
    created_to: "",
  });

  const { user } = useUser();

  const fetchMyTransactions = useCallback(
    async (newFilters = null) => {
      if (!user) {
        setLoading(false);
        setTransactionsData([]);
        setCount(0);
        setTotalPages(0);
        return;
      }

      // Update filters if new ones are provided
      if (newFilters) {
        setFilters(newFilters);
      }

      const currentFilters = newFilters || filters;

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

        if (["advance_salary", "pay_stopage"].includes(type)) {
          query = query.eq("type", type);
        }

        if (type === "allowance_requests") {
          query.eq("request_by_id", user?.id);
        } else {
          if (employeeId && type === "course_applications") {
            query.eq("applicant_id", employeeId);
          } else if (employeeId && type === "suggestion_request") {
            query.eq("reporter_employee_id", employeeId);
          } 
          else if (employeeId){

            if(type === "master_data_request" || type === "document_requests" || type === "resignation_request")
                  query.eq("created_by", employeeId || user?.id);
                else{

            if (employeeId) {
              query.eq("employee_id", employeeId);
            } else {
              query.eq("employee_id", user?.id);
            }
          }
          }
        }


        

        query = applySearchFilter(query, type, searchQuery);
        if (typeof currentFilters?.is_approved !== "undefined") {
          if (currentFilters?.is_approved) {
            query = query.not("status", "eq", "pending");
          }
        }

        if (currentFilters?.status && currentFilters?.status !== "all") {
          query = query.eq("status", currentFilters?.status);
        }

        if (currentFilters?.created_from) {
          const startDate = new Date(currentFilters.created_from);
          startDate.setHours(0, 0, 0, 0);
          query = query.gte("created_at", startDate.toISOString());
        }

        if (currentFilters?.created_to) {
          const endDate = new Date(currentFilters.created_to);
          endDate.setHours(23, 59, 59, 999);
          query = query.lte("created_at", endDate.toISOString());
        }

        const {
          data,
          error: sbError,
          count: totalCount,
        } = await query
          .order("created_at", { ascending: false })
          .range(from, to);

        if (sbError) {
          throw new Error(sbError.message || "Database query failed");
        }

        setTransactionsData(data || []);
        setCount(totalCount || 0);
        setTotalPages(Math.ceil((totalCount || 0) / pageSize));
      } catch (err) {
        console.error("Error fetching approvals:", err);
        const errorMessage = err.message || "An unexpected error occurred";
        setError(errorMessage);
        toast.error(`Error loading approvals: ${errorMessage}`);

        setTransactionsData([]);
        setCount(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize, searchQuery, type, user, employeeId, filters]
  );

  useEffect(() => {
    let isCancelled = false;
    let timeoutId;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchMyTransactions();
      }
    };

    if (searchQuery && searchQuery.trim()) {
      timeoutId = setTimeout(executeFetch, 300);
    } else {
      executeFetch();
    }

    return () => {
      isCancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [fetchMyTransactions, page, pageSize, searchQuery, type, user, filters]);

  return {
    transactionsData,
    totalPages,
    count,
    error,
    loading,
    refetch: fetchMyTransactions,
  };
}

export function useSendReminder(type = "loan_requests") {
  const [loading, setLoading] = useState(false);
  const sendReminder = useCallback(
    async (row, refetch) => {
      setLoading(true);
      try {
        const { table } = TRANSACTION_TYPE_MAP[type];
        const { data: inserted, error: insertError } = await supabase
          .from(table)
          .update({ reminder_count: row?.reminder_count + 1 })
          .eq("id", row?.id)
          .select();

        if (insertError) {
          throw new Error(insertError);
        }

        toast.success(`Reminder sent successfully.`);
        refetch();
        return { data: inserted, error: null };
      } catch (err) {
        toast.error(`An unexpected error occurred: ${err.message || err}`);
        return { data: null, error: err };
      } finally {
        setLoading(false);
      }
    },
    [type]
  );

  return { sendReminder, loading };
}

// export function useEsclateRequest(type = "loan_requests") {
//   const [loading, setLoading] = useState(false);
//   const esclateRequest = useCallback(
//     async (row, refetch) => {
//       setLoading(true);
//       try {
//         const { table } = TRANSACTION_TYPE_MAP[type];

//         let payload = {
//           is_manager_approve: "approved",
//           is_hr_approve: "approved",
//           escalated: true,
//         };

//         if (type === "suggestion_request") {
//           payload = {...payload, status: "pending" }
//         }

//         const { data: inserted, error: insertError } = await supabase
//           .from(table)
//           .update(payload)
//           .eq("id", row?.id)
//           .select();

//         if (insertError) {
//           throw new Error(insertError);
//         }

//         toast.success(`Reuqest Esclated successfully.`);
//         refetch();
//         return { data: inserted, error: null };
//       } catch (err) {
//         toast.error(`An unexpected error occurred: ${err.message || err}`);
//         return { data: null, error: err };
//       } finally {
//         setLoading(false);
//       }
//     },
//     [type]
//   );

//   return { esclateRequest, loading };
// }


export function useEsclateRequest(type = "loan_requests") {
  const [loading, setLoading] = useState(false);

  const esclateRequest = useCallback(
    async (row, refetch) => {
      setLoading(true);
      try {
        const { table } = TRANSACTION_TYPE_MAP[type];

        // Use the passed row directly
        const currentWorkflow = Array.isArray(row?.status_workflow)
          ? [...row.status_workflow]
          : [];

        // Update roles' statuses
        const updatedWorkflow = currentWorkflow.map((step) =>
          ["manager", "hod", "hr"].includes(step.role)
            ? { ...step, status: "approved" }
            : step
        );

        // Build payload
        let payload = {
          escalated: true,
          status_workflow: updatedWorkflow,
        };

        if (type === "suggestion_request") {
          payload.status = "pending";
        }

        // Update record in Supabase
        const { data: updated, error: updateError } = await supabase
          .from(table)
          .update(payload)
          .eq("id", row.id)
          .select();

        if (updateError) throw new Error(updateError.message);

        toast.success(`Request escalated successfully.`);
        refetch?.();
        return { data: updated, error: null };

      } catch (err) {
        toast.error(`An unexpected error occurred: ${err.message || err}`);
        return { data: null, error: err };
      } finally {
        setLoading(false);
      }
    },
    [type]
  );

  return { esclateRequest, loading };
}
