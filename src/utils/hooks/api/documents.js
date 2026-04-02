import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast"; // or your preferred toast library
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";
import { useEmployeeRecord } from "../../../context/EmployeeRecordContext";

export function useMyDocuments(
  page = 0,
  searchQuery = "",
  filters = {},
  perPage = 10
) {
  const [documents, setDocuments] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchDocuments = useCallback(
    async (isCancelled) => {
      if (!employeeId || isCancelled()) return;
      try {
        setLoading(true);
        setError(null);

        const from = page * perPage;
        const to = from + perPage - 1;
        let query = supabase
          .from("my_documents")
          .select("*", { count: "exact" })
          .eq("is_deleted", false)
          .eq("created_by", employeeId);
        if (searchQuery) {
          query = query.or(
            `custom_title.ilike.%${searchQuery}%,document_type.ilike.%${searchQuery}%,status.ilike.%${searchQuery}%`
          );
        }
        if (filters.status) {
          query = query.eq("status", filters.status);
        }
        if (filters.type) {
          query = query.eq("documentType", filters.type);
        }
        if (filters.leave_from) {
          query = query.gte("created_on", filters.leave_from);
        }
        if (filters.leave_to) {
          query = query.lte("created_on", filters.leave_to);
        }
        query = query.order("created_on", { ascending: false });
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
          setError(error);
          setDocuments([]);
          setTotalPages(0);
          setCount(0);
          return;
        }
        setDocuments(data || []);
        setCount(count || 0);
        setTotalPages(Math.ceil((count || 0) / perPage));
      } catch (err) {
        if (!isCancelled()) setError(err);
      } finally {
        if (!isCancelled()) setLoading(false);
      }
    },
    [page, searchQuery, filters, perPage, employeeId]
  );

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchDocuments(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchDocuments]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchDocuments(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchDocuments]);

  return {
    documents,
    totalPages,
    error,
    count,
    loading,
    refetch,
  };
}

export function useMyDocuments2(
  page = 0,
  searchQuery = "",
  filters = {},
  perPage = 10
) {
  const { record } = useEmployeeRecord();

  const employeeId = record?.id;
  const [documents, setDocuments] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  // const employeeId = user?.id;

  const fetchDocuments = useCallback(
    async (isCancelled) => {
      if (!employeeId || isCancelled()) return;
      try {
        setLoading(true);
        setError(null);

        const from = page * perPage;
        const to = from + perPage - 1;
        let query = supabase
          .from("my_documents")
          .select("*", { count: "exact" })
          .eq("is_deleted", false)
          .eq("created_by", employeeId);
        if (searchQuery) {
          query = query.or(
            `custom_title.ilike.%${searchQuery}%,document_type.ilike.%${searchQuery}%,status.ilike.%${searchQuery}%`
          );
        }
        if (filters.status) {
          query = query.eq("status", filters.status);
        }
        if (filters.type) {
          query = query.eq("documentType", filters.type);
        }
        if (filters.leave_from) {
          query = query.gte("created_on", filters.leave_from);
        }
        if (filters.leave_to) {
          query = query.lte("created_on", filters.leave_to);
        }
        query = query.order("created_on", { ascending: false });
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
          setError(error);
          setDocuments([]);
          setTotalPages(0);
          setCount(0);
          return;
        }
        setDocuments(data || []);
        setCount(count || 0);
        setTotalPages(Math.ceil((count || 0) / perPage));
      } catch (err) {
        if (!isCancelled()) setError(err);
      } finally {
        if (!isCancelled()) setLoading(false);
      }
    },
    [page, searchQuery, filters, perPage, employeeId]
  );

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchDocuments(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchDocuments]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchDocuments(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchDocuments]);

  return {
    documents,
    totalPages,
    error,
    count,
    loading,
    refetch,
  };
}

// CREATE HOOK
export function useCreateMyDocument() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createMyDocument = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from("my_documents")
        .insert([payload])
        .select()
        .single();

      if (sbError) {
        throw sbError;
      }

      toast.success("Document created successfully!");
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Creation failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createMyDocument, loading, error };
}

// UPDATE HOOK
export function useUpdateMyDocument() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateMyDocument = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from("my_documents")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (sbError) {
        throw sbError;
      }

      toast.success("Document updated successfully!");
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Update failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateMyDocument, loading, error };
}

export function useSingleMyDocument() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getMyDocument = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from("my_documents")
        .select("*")
        .eq("id", id)
        // .single();
        .maybeSingle();

      if (sbError) {
        throw sbError;
      }

      toast.success("Document Fetched successfully!");
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Update failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { getMyDocument };
}

// DELETE HOOK (Soft Delete)
export function useDeleteMyDocument() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteMyDocument = useCallback(async (ids) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from("my_documents");

      if (Array.isArray(ids)) {
        query = query.update({ is_deleted: true }).in("id", ids);
      } else {
        query = query.update({ is_deleted: true }).eq("id", ids);
      }

      const { error: sbError, data } = await query;

      if (sbError) {
        throw sbError;
      }

      toast.success(
        Array.isArray(ids)
          ? `Deleted ${ids.length} documents successfully.`
          : "Document deleted successfully."
      );
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Deletion failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteMyDocument, loading, error };
}

export function useMrnaPaidDocument() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Returns false if ANY matching row exists:
   *   fees_paid_by = 'mrna_paid' AND created_At < today (date-only)
   * Otherwise returns true.
   *
   * @param {number|string} userId - column `user_id` in `my_documents`
   */
  const checkMrnaFeeAllowedForEmployee = useCallback(async (employee_id) => {
    setLoading(true);
    setError(null);

    try {
      // Build YYYY-MM-DD string for date-only comparison
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const todayStr = `${yyyy}-${mm}-${dd}`;

      // Query only needed fields; filter on server
      const { data, error: sbError } = await supabase
        .from("my_documents")
        .select("id, author_id, created_at, fees_paid_by")
        .eq("author_id", employee_id) // <-- change if your user column differs
        .eq("fees_paid_by", "mrna_paid");
      // .lt("created_at", todayStr);      // strictly before today (date-only)

      if (sbError) throw sbError;

      const hasPastMrnaPaid = (data?.length ?? 0) > 0;
      const allowed = !hasPastMrnaPaid;

      // Optional: toast feedback
      // toast.success(`Check complete: ${allowed ? "allowed" : "blocked"}`);

      return allowed; // false = block, true = allowed
    } catch (err) {
      const msg = err?.message || String(err);
      setError(msg);
      toast.error(`Check failed: ${msg}`);
      return false; // safe default
    } finally {
      setLoading(false);
    }
  }, []);

  return { checkMrnaFeeAllowedForEmployee, loading, error };
}
