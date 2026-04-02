import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";
import toast from "react-hot-toast";

// Fetch all assets (unique assets from assets_transactions)
export function useAssets(page = 0, searchQuery = "", filters = {}, perPage = 20) {
  const [assetsData, setAssetsData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from("assets_transactions")
        .select(
          `*,
          employee: employees!assets_transactions_assigned_to_fkey(id, employee_code, candidates(first_name, second_name)),
          asset_category: asset_categories!assets_transactions_asset_category_id_fkey(id, name),
          created_by_emp: employees!assets_transactions_created_by_fkey(id, employee_code, candidates(first_name))
          `,
          { count: "exact" }
        )
        .eq("is_deleted", false);

      if (searchQuery) {
        query = query.or(
          `asset_code.ilike.%${searchQuery}%,serial_number.ilike.%${searchQuery}%,asset_note.ilike.%${searchQuery}%`
        );
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.category_id) {
        query = query.eq("asset_category_id", filters.category_id);
      }
      if (filters.branch_id) {
        query = query.eq("branch_id", filters.branch_id);
      }
      if (filters.assignment_type) {
        query = query.eq("assignment_type", filters.assignment_type);
      }

      query = query.order("created_at", { ascending: false });
      const { data, error: queryError, count: totalCount } = await query.range(from, to);

      if (queryError) {
        setError(queryError);
        toast.error("Failed to fetch assets");
        return;
      }

      // Get unique assets by asset_code
      const assetMap = {};
      (data || []).forEach((t) => {
        const key = t.asset_code;
        if (!assetMap[key] || new Date(t.created_at) > new Date(assetMap[key].created_at)) {
          assetMap[key] = t;
        }
      });

      const uniqueAssets = Object.values(assetMap);
      const transformed = uniqueAssets.map((a) => ({
        ...a,
        employeeName: a.employee?.candidates
          ? `${a.employee.candidates.first_name || ""} ${a.employee.candidates.second_name || ""}`.trim()
          : "Unassigned",
        categoryName: a.asset_category?.name || "N/A",
      }));

      const safeCount = totalCount ?? uniqueAssets.length;
      setAssetsData(transformed);
      setCount(safeCount);
      setTotalPages(Math.ceil(safeCount / perPage));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filters, perPage]);

  useEffect(() => {
    let isCancelled = false;
    fetchAssets();
    return () => { isCancelled = true; };
  }, [fetchAssets]);

  const refetch = useCallback(() => fetchAssets(), [fetchAssets]);

  return { assetsData, totalPages, count, loading, error, refetch };
}

// Create asset
export function useCreateAsset() {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const create = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("assets_transactions")
        .insert([{ ...payload, created_by: user?.id }])
        .select()
        .single();
      if (error) throw error;
      toast.success("Asset created successfully!");
      return data;
    } catch (err) {
      toast.error(`Error: ${err.message || err}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);
  return { create, loading };
}

// Update asset
export function useUpdateAsset() {
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id, payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("assets_transactions")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      toast.success("Asset updated successfully!");
      return data;
    } catch (err) {
      toast.error(`Error: ${err.message || err}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  return { update, loading };
}

// Delete asset
export function useDeleteAsset() {
  const [loading, setLoading] = useState(false);
  const deleteAsset = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("assets_transactions")
        .update({ is_deleted: true })
        .eq("id", id);
      if (error) throw error;
      toast.success("Asset deleted successfully!");
    } catch (err) {
      toast.error(`Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, []);
  return { deleteAsset, loading };
}

// Asset dashboard stats
export function useAssetDashboardStats() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    assigned: 0,
    available: 0,
    maintenance: 0,
    byCategory: [],
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const [totalRes, assignedRes, availableRes, maintenanceRes, categoryRes, recentRes] = await Promise.all([
          supabase.from("assets_transactions").select("id", { count: "exact", head: true }).eq("is_deleted", false),
          supabase.from("assets_transactions").select("id", { count: "exact", head: true }).eq("is_deleted", false).not("employee_id", "is", null),
          supabase.from("assets_transactions").select("id", { count: "exact", head: true }).eq("is_deleted", false).is("employee_id", null),
          supabase.from("assets_transactions").select("id", { count: "exact", head: true }).eq("is_deleted", false).eq("status", "maintenance"),
          supabase.from("assets_transactions").select("asset_category_id, asset_category:asset_categories!assets_transactions_asset_category_id_fkey(name)", { count: "exact" }).eq("is_deleted", false),
          supabase.from("assets_transactions").select("*, asset_category:asset_categories!assets_transactions_asset_category_id_fkey(name), employee:employees!assets_transactions_assigned_to_fkey(id, candidates(first_name, second_name))").eq("is_deleted", false).order("created_at", { ascending: false }).limit(10),
        ]);

        const catMap = {};
        (categoryRes.data || []).forEach((a) => {
          const name = a.asset_category?.name || "Uncategorized";
          catMap[name] = (catMap[name] || 0) + 1;
        });

        setStats({
          totalAssets: totalRes.count || 0,
          assigned: assignedRes.count || 0,
          available: availableRes.count || 0,
          maintenance: maintenanceRes.count || 0,
          byCategory: Object.entries(catMap).map(([name, count]) => ({ name, count })),
          recentTransactions: recentRes.data || [],
        });
      } catch (err) {
        console.error("Asset dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { stats, loading };
}

// Asset reports
export function useAssetReports() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({ depreciation: [], register: [], maintenanceCost: [] });

  const fetchReports = useCallback(async (reportType) => {
    setLoading(true);
    try {
      if (reportType === "register") {
        const { data } = await supabase
          .from("assets_transactions")
          .select("*, asset_category:asset_categories!assets_transactions_asset_category_id_fkey(name), employee:employees!assets_transactions_assigned_to_fkey(id, candidates(first_name, second_name))")
          .eq("is_deleted", false)
          .order("created_at", { ascending: false });
        setReportData(prev => ({ ...prev, register: data || [] }));
      } else if (reportType === "depreciation") {
        const { data } = await supabase
          .from("assets_transactions")
          .select("*, asset_category:asset_categories!assets_transactions_asset_category_id_fkey(name)")
          .eq("is_deleted", false)
          .order("asset_value", { ascending: false });
        // Simulate depreciation (10% per year)
        const withDepreciation = (data || []).map(a => {
          const years = Math.max(1, (new Date() - new Date(a.from_date)) / (365.25 * 24 * 60 * 60 * 1000));
          const depreciatedValue = Math.max(0, a.asset_value * Math.pow(0.9, years));
          return { ...a, depreciated_value: Math.round(depreciatedValue * 100) / 100, years_owned: Math.round(years * 10) / 10 };
        });
        setReportData(prev => ({ ...prev, depreciation: withDepreciation }));
      } else if (reportType === "maintenance") {
        const { data } = await supabase
          .from("asset_maintenance")
          .select("*, asset:assets_transactions(asset_code, asset_note)")
          .eq("is_deleted", false)
          .order("scheduled_date", { ascending: false });
        setReportData(prev => ({ ...prev, maintenanceCost: data || [] }));
      }
    } catch (err) {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  }, []);

  return { reportData, loading, fetchReports };
}
