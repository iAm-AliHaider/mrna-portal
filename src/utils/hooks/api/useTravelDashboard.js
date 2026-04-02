import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

export function useTravelDashboard() {
  const [stats, setStats] = useState({
    activeRequests: 0,
    pendingApprovals: 0,
    approvedThisMonth: 0,
    countriesVisited: 0,
    totalExpenseClaimed: 0,
    perDiemPaid: 0,
    recentRequests: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

        const [activeRes, pendingRes, approvedRes, countriesRes, expenseRes, perDiemRes, recentRes] = await Promise.all([
          supabase.from("business_travels").select("id", { count: "exact", head: true }).eq("is_deleted", false).eq("status", "approved"),
          supabase.from("business_travels").select("id", { count: "exact", head: true }).eq("is_deleted", false).eq("status", "pending"),
          supabase.from("business_travels").select("id", { count: "exact", head: true }).eq("is_deleted", false).eq("status", "approved").gte("created_at", monthStart),
          supabase.from("business_travels").select("country", { count: "exact" }).eq("is_deleted", false).eq("status", "approved"),
          supabase.from("business_travels").select("amount_due", { count: "exact" }).eq("is_deleted", false).eq("status", "approved"),
          supabase.from("business_travels").select("daily_per_diem_rate", { count: "exact" }).eq("is_deleted", false).eq("status", "approved"),
          supabase.from("business_travels").select("*, employee:employees!business_travels_employee_id_fkey(id, employee_code, candidates(first_name, second_name))").eq("is_deleted", false).order("created_at", { ascending: false }).limit(10),
        ]);

        const uniqueCountries = new Set((countriesRes.data || []).map(r => r.country));
        const totalExpense = (expenseRes.data || []).reduce((sum, r) => sum + (parseFloat(r.amount_due) || 0), 0);
        const totalPerDiem = (perDiemRes.data || []).reduce((sum, r) => sum + (parseFloat(r.daily_per_diem_rate) || 0), 0);

        const transformedRecent = (recentRes.data || []).map(r => ({
          ...r,
          employeeName: r.employee?.candidates ? `${r.employee.candidates.first_name} ${r.employee.candidates.second_name}` : "N/A",
        }));

        setStats({
          activeRequests: activeRes.count || 0,
          pendingApprovals: pendingRes.count || 0,
          approvedThisMonth: approvedRes.count || 0,
          countriesVisited: uniqueCountries.size,
          totalExpenseClaimed: Math.round(totalExpense * 100) / 100,
          perDiemPaid: Math.round(totalPerDiem * 100) / 100,
          recentRequests: transformedRecent,
        });
      } catch (err) {
        console.error("Travel dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { stats, loading };
}
