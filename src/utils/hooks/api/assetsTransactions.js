import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
import { useUser } from "../../../context/UserContext";

// Fetch all assets transactions with pagination
export function useAssetsTransactions(
  page = 0,
  searchQuery = "",
  filters = {},
  perPage = 10
) {
  const [transactionsData, setTransactionsData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(
    async (isCancelled) => {
      try {
        setLoading(true);
        setError(null);

        const from = page * perPage;
        const to = from + perPage - 1;

        let query = supabase
          .from("assets_transactions")
          .select(
            `*, 
            employee: employees!assets_transactions_assigned_to_fkey!inner(*,  candidate: candidates!employees_candidate_id_fkey (*)),
            asset_category: asset_categories!assets_transactions_asset_category_id_fkey!inner(*)
            `,
            { count: "exact" }
          )
          .eq("is_deleted", false);

        if (searchQuery) {
          query = query.or(
            `asset_code.ilike.%${searchQuery}%,asset_note.ilike.%${searchQuery}%,notes.ilike.%${searchQuery}%`
          );
        }

        if (filters.employee_id) {
          query = query.eq("employee_id", filters.employee_id);
        }
        if (filters.assignment_type) {
          query = query.eq("assignment_type", filters.assignment_type);
        }
        if (filters.status) {
          query = query.eq("status", filters.status);
        }
        if (filters.from_date) {
          const fromDate = new Date(filters.from_date);
          fromDate.setHours(0, 0, 0, 0);
          query = query.gte("from_date", fromDate.toISOString());
        }
        if (filters.to_date) {
          const toDate = new Date(filters.to_date);
          toDate.setHours(23, 59, 59, 999);
          query = query.lte("to_date", toDate.toISOString());
        }

        query = query.order("created_at", { ascending: false });
        const {
          data,
          error: queryError,
          count: totalCount,
        } = await query.range(from, to);

        if (isCancelled()) return;

        if (queryError) {
          setError(queryError);
          setTransactionsData([]);
          setTotalPages(0);
          setCount(0);
          toast.error("Failed to fetch assets transactions");
          return;
        }

        // Transform data to include employee name and other readable fields
        const transformedData = (data || []).map((transaction) => ({
          ...transaction,
          employeeName: transaction.employee?.candidate
            ? `${transaction.employee.employee_code || ""} - ${transaction.employee.candidate.first_name || ""} ${
                transaction.employee.candidate.second_name || ""
              } ${transaction.employee.candidate.third_name || ""} ${
                transaction.employee.candidate.forth_name || ""
              } ${transaction.employee.candidate.family_name || ""}`
            : "N/A",
          employeeNumber: transaction.employee?.employee_code || "N/A",
          assetCategoryName: transaction.asset_category?.name || "N/A",
          assetName: transaction.asset?.name || "N/A",
          createdBy: transaction.created_by || "N/A",
          modifiedBy: transaction.updated_by || "N/A",
          createdDate: new Date(transaction.created_at).toLocaleDateString(),
          modifiedDate: new Date(transaction.updated_at).toLocaleDateString(),
        }));

        const safeCount = totalCount ?? 0;
        const safeTotalPages = Math.ceil(safeCount / perPage);

        setTransactionsData(transformedData);
        setCount(safeCount);
        setTotalPages(safeTotalPages);
      } catch (err) {
        if (!isCancelled()) setError(err);
      } finally {
        if (!isCancelled()) setLoading(false);
      }
    },
    [page, searchQuery, filters, perPage]
  );

  useEffect(() => {
    let isCancelled = false;
    fetchTransactions(() => isCancelled);
    return () => {
      isCancelled = true;
    };
  }, [fetchTransactions]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    fetchTransactions(() => isCancelled);
  }, [fetchTransactions]);

  return {
    transactionsData,
    totalPages,
    error,
    count,
    loading,
    refetch,
  };
}

// Create new assets transaction
export function useCreateAssetsTransaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

  const createAssetsTransaction = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: sbError } = await supabase
          .from("assets_transactions")
          .insert([payload])
          .select()
          .single();

        if (sbError) {
          throw sbError;
        }

        toast.success("Assets transaction created successfully!");
        setLoading(false);
        return data;
      } catch (err) {
        setError(err.message || err);
        toast.error(`Creation failed: ${err.message || err}`);
        setLoading(false);
        return null;
      }
    },
    [user]
  );

  return { createAssetsTransaction, loading, error };
}

// Update assets transaction
export function useUpdateAssetsTransaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

  const updateAssetsTransaction = useCallback(
    async (id, payload) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: sbError } = await supabase
          .from("assets_transactions")
          .update(payload)
          .eq("id", id)
          .select()
          .single();

        if (sbError) {
          throw sbError;
        }

        toast.success("Assets transaction updated successfully!");
        setLoading(false);
        return data;
      } catch (err) {
        setError(err.message || err);
        toast.error(`Update failed: ${err.message || err}`);
        setLoading(false);
        return null;
      }
    },
    [user]
  );

  return { updateAssetsTransaction, loading, error };
}

// Delete assets transaction (soft delete)
export function useDeleteAssetsTransaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

  const deleteAssetsTransaction = useCallback(
    async (ids) => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase.from("assets_transactions");

        if (Array.isArray(ids)) {
          query = query
            .update({
              is_deleted: true,
              updated_by: user?.id || 1,
              updated_at: new Date().toISOString(),
            })
            .in("id", ids);
        } else {
          query = query
            .update({
              is_deleted: true,
              updated_by: user?.id || 1,
              updated_at: new Date().toISOString(),
            })
            .eq("id", ids);
        }

        const { error: sbError, data } = await query;

        if (sbError) {
          throw sbError;
        }

        toast.success(
          Array.isArray(ids)
            ? `Deleted ${ids.length} assets transactions successfully.`
            : "Assets transaction deleted successfully."
        );
        setLoading(false);
        return data;
      } catch (err) {
        if (err.code === "23503") {
          toast.error(
            "Cannot delete assets transaction: referenced by other records"
          );
          return null;
        }
        setError(err.message || err);
        toast.error(`Deletion failed: ${err.message || err}`);
        setLoading(false);
        return null;
      }
    },
    [user]
  );

  return { deleteAssetsTransaction, loading, error };
}

// Get single assets transaction by ID
export function useAssetsTransaction(id) {
  const [transactionData, setTransactionData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTransaction = useCallback(
    async (isCancelled) => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: sbError } = await supabase
          .from("assets_transactions")
          .select(
            `
          *,
          employee: employees!assets_transactions_employee_id_fkey(
            id,
            employee_code,
            candidate: candidates!employees_candidate_id_fkey(
              first_name,
              last_name,
              middle_name
            )
          ),
          asset_category: asset_categories!assets_transactions_asset_category_id_fkey(
            id,
            name
          ),
          asset: assets!assets_transactions_asset_id_fkey(
            id,
            name,
            code
          )
        `
          )
          .eq("id", id)
          .eq("is_deleted", false)
          .single();

        if (isCancelled()) return;

        if (sbError) {
          setError(sbError);
          setTransactionData(null);
          return;
        }

        setTransactionData(data);
      } catch (err) {
        if (!isCancelled()) setError(err);
      } finally {
        if (!isCancelled()) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    let isCancelled = false;
    fetchTransaction(() => isCancelled);
    return () => {
      isCancelled = true;
    };
  }, [fetchTransaction]);

  return { transactionData, error, loading };
}

// Get assignment type options
export const ASSIGNMENT_TYPE_OPTIONS = [
  { value: "add_asset_to_employee", label: "Add asset to employee" },
  { value: "take_asset_from_employee", label: "Take asset from employee" },
  // { value: 'transfer_asset', label: 'Transfer asset' },
  // { value: "return_asset", label: "Return asset" },
  { value: "maintenance_asset", label: "Maintenance asset" },
];

// Get status options
export const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];
