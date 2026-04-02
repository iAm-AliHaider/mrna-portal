import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../supabaseClient";

export function useAssetReport(filters = {}) {
  const [summary, setSummary] = useState({
    totalAssets: 0,
    byCategory: [],
    byStatus: [],
    byEmployee: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Total assets
      const { count: totalAssets } = await supabase
        .from("assets")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false);

      // Assets by category
      const { data: byCategoryRaw } = await supabase
        .from("assets")
        .select(`
          asset_category_id,
          category:asset_categories!assets_asset_category_id_fkey(name)
        `)
        .eq("is_deleted", false);

      const categoryMap = {};
      (byCategoryRaw || []).forEach((a) => {
        const catName = a.category?.name || "Uncategorized";
        categoryMap[catName] = (categoryMap[catName] || 0) + 1;
      });
      const byCategory = Object.entries(categoryMap).map(([name, count]) => ({
        name,
        count,
      }));

      // Assets by status
      const { data: byStatusRaw } = await supabase
        .from("assets")
        .select("status")
        .eq("is_deleted", false);

      const statusMap = {};
      (byStatusRaw || []).forEach((a) => {
        const status = a.status || "Unknown";
        statusMap[status] = (statusMap[status] || 0) + 1;
      });
      const byStatus = Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
      }));

      // Assets by employee
      const { data: byEmployeeRaw } = await supabase
        .from("assets")
        .select(`
          assigned_to,
          assigned_to_emp:employees!assets_assigned_to_fkey(
            id,
            employee_code,
            candidates:candidates!employees_candidate_id_fkey(
              first_name,
              second_name,
              third_name,
              forth_name,
              family_name
            )
          )
        `)
        .eq("is_deleted", false)
        .not("assigned_to", "is", null);

      const employeeMap = {};
      (byEmployeeRaw || []).forEach((a) => {
        if (a.assigned_to_emp) {
          const c = a.assigned_to_emp.candidates || {};
          const name = `${a.assigned_to_emp.employee_code || ""} - ${c.first_name || ""} ${c.second_name || ""}`.trim();
          employeeMap[name] = (employeeMap[name] || 0) + 1;
        }
      });
      const byEmployee = Object.entries(employeeMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      setSummary({
        totalAssets: totalAssets || 0,
        byCategory,
        byStatus,
        byEmployee,
      });
    } catch (err) {
      setError(err);
      toast.error("Failed to fetch asset report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { summary, loading, error, refetch: fetchReport };
}
