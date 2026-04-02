import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import { toast } from "react-hot-toast";
import { useEmployeeRecord } from "../../../context/EmployeeRecordContext";

export function useCreateSuggestionsAndGrievance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createSuggestionsAndGrievance = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("grievance_suggestions")
        .insert([payload])
        .select()
        .single();
      if (error) {
        setError(error);
        toast.error("Creation failed: " + (error.message || error));
        setLoading(false);
        return { data: null, error };
      }
      toast.success("Suggestion/Grievance created successfully!");
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err);
      toast.error("Creation failed: " + (err.message || err));
      setLoading(false);
      return { data: null, error: err };
    }
  }, []);

  return { createSuggestionsAndGrievance, loading, error };
}

export function useUpdateSuggestionsAndGrievance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateSuggestionsAndGrievance = useCallback(
    async (
      id,
      status,
      note,
      delegateEmployeeId,
      user = {},
      selectedRecord = {}
    ) => {
      setLoading(true);
      setError(null);
      const previousRecord = selectedRecord?.review_notes
        ? JSON.parse(selectedRecord?.review_notes)
        : [];
      const noteData = [
        ...previousRecord,
        { status: status, note: note, updated_by: user?.full_name },
      ];
      try {
        const { data, error } = await supabase
          .from("grievance_suggestions")
          .update({
            status,
            review_notes: JSON.stringify(noteData),
            delegate_employee: delegateEmployeeId,
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          setError(error);
          toast.error("Update failed: " + (error.message || error));
          setLoading(false);
          return { data: null, error };
        }

        toast.success("Status updated successfully!");
        setLoading(false);
        return { data, error: null };
      } catch (err) {
        setError(err);
        toast.error("Update failed: " + (err.message || err));
        setLoading(false);
        return { data: null, error: err };
      }
    },
    []
  );

  return { updateSuggestionsAndGrievance, loading, error };
}

export function useGetSingleGrievanceSuggestion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSingleGrievanceSuggestion = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data: suggestion, error } = await supabase
        .from("grievance_suggestions")
        .select(
          `
          *,
          reporter_employee:reporter_employee_id(id, candidate:candidate_id(id, first_name)),
          assigned_to:assigned_to_id(id, candidate:candidate_id(id, first_name)),
          reviewed_by:reviewed_by_id(id, candidate:candidate_id(id, first_name)),
          created_by_employee:created_by(id, candidate:candidate_id(id, first_name)),
          updated_by_employee:updated_by(id, candidate:candidate_id(id, first_name))
        `
        )
        .eq("id", id)
        .eq("is_deleted", false)
        .maybeSingle();

      if (error) {
        setError(error);
        toast.error("Failed to fetch data: " + (error.message || error));
        return { data: null, error };
      }

      if (!suggestion) return { data: null, error: null };

      // Attach related names
      suggestion.reporter_name =
        suggestion?.reporter_employee?.candidate?.first_name || "—";
      suggestion.assigned_to_name =
        suggestion?.assigned_to?.candidate?.first_name || "—";
      suggestion.reviewed_by_name =
        suggestion?.reviewed_by?.candidate?.first_name || "—";
      suggestion.created_by_name =
        suggestion?.created_by_employee?.candidate?.first_name || "—";
      suggestion.updated_by_name =
        suggestion?.updated_by_employee?.candidate?.first_name || "—";

      // Fetch employees_involved and witnesses with candidate names
      const allIds = [
        ...(suggestion.employees_involved || []),
        ...(suggestion.witnesses || []),
      ];
      const uniqueIds = [...new Set(allIds)].filter(Boolean);

      if (uniqueIds.length > 0) {
        const { data: involvedEmployees, error: involvedError } = await supabase
          .from("employees")
          .select("id, candidate:candidate_id(id, first_name)")
          .in("id", uniqueIds);

        if (!involvedError && involvedEmployees) {
          const employeeMap = Object.fromEntries(
            involvedEmployees.map((e) => [
              e.id,
              { id: e.id, first_name: e.candidate?.first_name || "—" },
            ])
          );

          suggestion.employees_involved = (
            suggestion.employees_involved || []
          ).map((id) => employeeMap[id] || { id, first_name: "—" });

          suggestion.witnesses = (suggestion.witnesses || []).map(
            (id) => employeeMap[id] || { id, first_name: "—" }
          );
        }
      }

      return { data: suggestion, error: null };
    } catch (err) {
      setError(err);
      toast.error("Failed to fetch data: " + (err.message || err));
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { getSingleGrievanceSuggestion, loading, error };
}

export function useGrievanceSuggestions(
  page = 0,
  searchQuery = "",
  filters = {},
  perPage = 10,
  user = null
) {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (isCancelled) => {
      try {
        if (!isCancelled()) {
          setLoading(true);
          setError(null);
        }
        const from = page * perPage;
        const to = from + perPage - 1;
        let query = supabase
          .from("grievance_suggestions")
          .select("*", { count: "exact" })
          .eq("is_deleted", false);

        // Role-based filtering
        if (user) {
          const userRole = user.role;

          if (userRole === "employee") {
            // Employee can only see their own suggestions/grievances
            query = query.or(
              `reporter_employee_id.eq.${user.id},escalation_level.eq.${user.id}`
            );
            // query = query.eq("reporter_employee_id", user.id);
          } else if (userRole === "manager") {
            // Manager can see their department's suggestions/grievances
            // First, get the manager's department
            const { data: managerData } = await supabase
              .from("employees")
              .select("department_id")
              .eq("id", user.id)
              .single();

            if (managerData?.department_id) {
              // Get all employees in the same department
              const { data: departmentEmployees } = await supabase
                .from("employees")
                .select("id")
                .eq("department_id", managerData.department_id);

              if (departmentEmployees && departmentEmployees.length > 0) {
                const departmentEmployeeIds = departmentEmployees.map(
                  (emp) => emp.id
                );
                query = query.in("reporter_employee_id", departmentEmployeeIds);
              }
            }
          }
          // HR role can see all suggestions/grievances (no additional filtering needed)
        }

        if (searchQuery) {
          query = query.or(
            `report_type.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`
          );
        }
        if (filters.status) {
          query = query.eq("status", filters.status);
        }
        if (filters.report_type) {
          query = query.eq("report_type", filters.report_type);
        }
        if (filters.urgency) {
          query = query.eq("urgency", filters.urgency);
        }
        if (filters.category) {
          query = query.eq("category", filters.category);
        }
        if (filters.priority) {
          query = query.eq("priority", filters.priority);
        }
        if (filters.from_date) {
          query = query.gte("report_date", filters.from_date);
        }
        if (filters.to_date) {
          query = query.lte("report_date", filters.to_date);
        }
        query = query.order("created_at", { ascending: false });
        query = query.range(from, to);
        const { data, error, count } = await query;
        if (isCancelled()) return;
        if (error) {
          setError(error);
          setData([]);
          setTotalPages(0);
          setCount(0);
          return;
        }
        setData(data || []);
        setCount(count || 0);
        setTotalPages(Math.ceil((count || 0) / perPage));
      } catch (err) {
        if (!isCancelled()) {
          setError(err);
        }
      } finally {
        if (!isCancelled()) {
          setLoading(false);
        }
      }
    },
    [page, searchQuery, filters, perPage, user]
  );

  useEffect(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchData(() => isCancelled);
      }
    };
    executeFetch();
    return () => {
      isCancelled = true;
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchData(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchData]);

  return { data, totalPages, count, loading, error, refetch };
}

export function useGrievanceSuggestions2(
  page = 0,
  searchQuery = "",
  filters = {},
  perPage = 10,
  user = null
) {
  const { record } = useEmployeeRecord();
  // console.log("record in useGrievanceSuggestions2", record);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (isCancelled) => {
      try {
        if (!isCancelled()) {
          setLoading(true);
          setError(null);
        }
        const from = page * perPage;
        const to = from + perPage - 1;
        let query = supabase
          .from("grievance_suggestions")
          .select("*", { count: "exact" })
          .eq("is_deleted", false)
          .filter("status", "ilike", "pending");

        // console.log("query in useGrievanceSuggestions2", query);
        // Role-based filtering
        if (record) {
          const userRoles = record?.role_columns?.roles || [];

          if (
            userRoles.includes("employee") &&
            !userRoles.includes("manager")
          ) {
            // Employee can only see their own suggestions/grievances
            query = query.or(
              `reporter_employee_id.eq.${record.id},escalation_level.eq.${record.id}`
            );
          } else if (userRoles.includes("manager")) {
            // Manager can see their department's suggestions/grievances
            // First, get the manager's department
            const { data: managerData } = await supabase
              .from("employees")
              .select("department_id")
              .eq("id", record.id)
              .single();

            if (managerData?.department_id) {
              // Get all employees in the same department
              const { data: departmentEmployees } = await supabase
                .from("employees")
                .select("id")
                .eq("department_id", managerData.department_id);

              if (departmentEmployees && departmentEmployees.length > 0) {
                const departmentEmployeeIds = departmentEmployees.map(
                  (emp) => emp.id
                );
                query = query.in("reporter_employee_id", departmentEmployeeIds);
              }
            }
          }
          // HR role can see all suggestions/grievances (no additional filtering needed)
        }

        if (searchQuery) {
          query = query.or(
            `report_type.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`
          );
        }
        // if (filters.status) {
        //   query = query.eq("status", filters.status);
        // }
        if (filters.report_type) {
          query = query.eq("report_type", filters.report_type);
        }
        if (filters.urgency) {
          query = query.eq("urgency", filters.urgency);
        }
        if (filters.category) {
          query = query.eq("category", filters.category);
        }
        if (filters.priority) {
          query = query.eq("priority", filters.priority);
        }
        if (filters.from_date) {
          query = query.gte("report_date", filters.from_date);
        }
        if (filters.to_date) {
          query = query.lte("report_date", filters.to_date);
        }
        query = query.order("created_at", { ascending: false });
        const { data, error, count } = await query;
        if (count > from) {
          query = query.range(from, to);
        }
        if (isCancelled()) return;
        if (error) {
          setError(error);
          setData([]);
          setTotalPages(0);
          setCount(0);
          return;
        }
        setData(data || []);
        setCount(count || 0);
        setTotalPages(Math.ceil((count || 0) / perPage));
      } catch (err) {
        if (!isCancelled()) {
          setError(err);
        }
      } finally {
        if (!isCancelled()) {
          setLoading(false);
        }
      }
    },
    [page, searchQuery, filters, perPage, user]
  );

  useEffect(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchData(() => isCancelled);
      }
    };
    executeFetch();
    return () => {
      isCancelled = true;
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchData(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchData]);

  return { data, totalPages, count, loading, error, refetch };
}
